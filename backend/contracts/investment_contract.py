"""
Algorand Smart Contract for Investment Management
This contract handles the creation, funding, and management of investments on Algorand blockchain.
"""

from pyteal import *

# Global state keys
INVESTMENT_ID = Bytes("investment_id")
BORROWER = Bytes("borrower")
INVESTOR = Bytes("investor")
AMOUNT = Bytes("amount")
INTEREST_RATE = Bytes("interest_rate")
DURATION = Bytes("duration")
STATUS = Bytes("status")
CREATED_AT = Bytes("created_at")
FUNDED_AT = Bytes("funded_at")
DUE_DATE = Bytes("due_date")
REPAYMENT_AMOUNT = Bytes("repayment_amount")
AMOUNT_REPAID = Bytes("amount_repaid")

# Status constants
PENDING = Int(0)
ACTIVE = Int(1)
COMPLETED = Int(2)
DEFAULTED = Int(3)
CANCELLED = Int(4)

def investment_contract():
    """Main investment contract logic"""
    
    # On creation, initialize the investment
    on_creation = Seq([
        # Set global state
        App.globalPut(INVESTMENT_ID, Txn.application_args[0]),
        App.globalPut(BORROWER, Txn.sender()),
        App.globalPut(INVESTOR, Global.zero_address()),
        App.globalPut(AMOUNT, Btoi(Txn.application_args[1])),
        App.globalPut(INTEREST_RATE, Btoi(Txn.application_args[2])),
        App.globalPut(DURATION, Btoi(Txn.application_args[3])),
        App.globalPut(STATUS, PENDING),
        App.globalPut(CREATED_AT, Global.latest_timestamp()),
        App.globalPut(FUNDED_AT, Int(0)),
        App.globalPut(DUE_DATE, Int(0)),
        App.globalPut(REPAYMENT_AMOUNT, Int(0)),
        App.globalPut(AMOUNT_REPAID, Int(0)),
        
        # Calculate repayment amount
        calculate_repayment(),
        
        Approve()
    ])
    
    # Handle funding the investment
    def fund_investment():
        return Seq([
            # Check if investment is pending
            Assert(App.globalGet(STATUS) == PENDING),
            
            # Set investor
            App.globalPut(INVESTOR, Txn.sender()),
            
            # Update status to active
            App.globalPut(STATUS, ACTIVE),
            App.globalPut(FUNDED_AT, Global.latest_timestamp()),
            
            # Calculate due date
            App.globalPut(DUE_DATE, Global.latest_timestamp() + App.globalGet(DURATION) * Int(86400)),
            
            # Transfer funds to borrower
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.Payment,
                TxnField.sender: Global.current_application_address(),
                TxnField.receiver: App.globalGet(BORROWER),
                TxnField.amount: App.globalGet(AMOUNT),
                TxnField.fee: Int(0)
            }),
            InnerTxnBuilder.Submit(),
            
            Approve()
        ])
    
    # Handle repayment
    def make_repayment():
        return Seq([
            # Check if investment is active
            Assert(App.globalGet(STATUS) == ACTIVE),
            
            # Check if sender is borrower
            Assert(Txn.sender() == App.globalGet(BORROWER)),
            
            # Update amount repaid
            App.globalPut(AMOUNT_REPAID, App.globalGet(AMOUNT_REPAID) + Txn.amount()),
            
            # Check if fully repaid
            If(App.globalGet(AMOUNT_REPAID) >= App.globalGet(REPAYMENT_AMOUNT))
            .Then(Seq([
                App.globalPut(STATUS, COMPLETED),
                # Transfer remaining funds to investor
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields({
                    TxnField.type_enum: TxnType.Payment,
                    TxnField.sender: Global.current_application_address(),
                    TxnField.receiver: App.globalGet(INVESTOR),
                    TxnField.amount: Txn.amount(),
                    TxnField.fee: Int(0)
                }),
                InnerTxnBuilder.Submit()
            ]))
            .Else(Seq([
                # Transfer partial repayment to investor
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields({
                    TxnField.type_enum: TxnType.Payment,
                    TxnField.sender: Global.current_application_address(),
                    TxnField.receiver: App.globalGet(INVESTOR),
                    TxnField.amount: Txn.amount(),
                    TxnField.fee: Int(0)
                }),
                InnerTxnBuilder.Submit()
            ])),
            
            Approve()
        ])
    
    # Handle default
    def mark_default():
        return Seq([
            # Check if investment is active
            Assert(App.globalGet(STATUS) == ACTIVE),
            
            # Check if due date has passed
            Assert(Global.latest_timestamp() > App.globalGet(DUE_DATE)),
            
            # Update status to defaulted
            App.globalPut(STATUS, DEFAULTED),
            
            Approve()
        ])
    
    # Handle cancellation
    def cancel_investment():
        return Seq([
            # Check if investment is pending
            Assert(App.globalGet(STATUS) == PENDING),
            
            # Check if sender is borrower
            Assert(Txn.sender() == App.globalGet(BORROWER)),
            
            # Update status to cancelled
            App.globalPut(STATUS, CANCELLED),
            
            Approve()
        ])
    
    # Calculate repayment amount
    def calculate_repayment():
        return Seq([
            App.globalPut(REPAYMENT_AMOUNT, 
                App.globalGet(AMOUNT) + 
                (App.globalGet(AMOUNT) * App.globalGet(INTEREST_RATE) / Int(100))
            )
        ])
    
    # Main router
    def handle_noop():
        return Cond(
            [Txn.application_args[0] == Bytes("fund"), fund_investment()],
            [Txn.application_args[0] == Bytes("repay"), make_repayment()],
            [Txn.application_args[0] == Bytes("default"), mark_default()],
            [Txn.application_args[0] == Bytes("cancel"), cancel_investment()]
        )
    
    # Handle close out
    def handle_closeout():
        return Approve()
    
    # Handle delete
    def handle_delete():
        return Approve()
    
    # Handle update
    def handle_update():
        return Approve()
    
    # Main program
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop()],
        [Txn.on_completion() == OnComplete.CloseOut, handle_closeout()],
        [Txn.on_completion() == OnComplete.DeleteApplication, handle_delete()],
        [Txn.on_completion() == OnComplete.UpdateApplication, handle_update()]
    )
    
    return program

# Compile the contract
if __name__ == "__main__":
    with open("investment_contract.teal", "w") as f:
        f.write(compileTeal(investment_contract(), Mode.Application))