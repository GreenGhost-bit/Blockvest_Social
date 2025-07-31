from pyteal import *

def investment_contract():
    
    # Global state keys
    borrower_key = Bytes("borrower")
    investor_key = Bytes("investor")
    amount_key = Bytes("amount")
    purpose_key = Bytes("purpose")
    interest_rate_key = Bytes("interest_rate")
    duration_key = Bytes("duration")
    status_key = Bytes("status")
    funded_at_key = Bytes("funded_at")
    repayment_amount_key = Bytes("repayment_amount")
    risk_score_key = Bytes("risk_score")
    verification_status_key = Bytes("verification_status")
    created_at_key = Bytes("created_at")
    
    # Local state keys for user data
    user_verification_key = Bytes("user_verification")
    user_risk_score_key = Bytes("user_risk_score")
    user_reputation_key = Bytes("user_reputation")
    
    # Enhanced investment creation with additional validation
    create_investment = Seq([
        # Validate minimum amount (0.001 ALGO)
        Assert(Btoi(Txn.application_args[0]) >= Int(1000000)),
        # Validate maximum amount (1000 ALGO)
        Assert(Btoi(Txn.application_args[0]) <= Int(1000000000000)),
        # Validate interest rate bounds
        Assert(And(
            Btoi(Txn.application_args[2]) >= Int(0),
            Btoi(Txn.application_args[2]) <= Int(100)
        )),
        # Validate duration bounds (1 day to 365 days)
        Assert(And(
            Btoi(Txn.application_args[3]) >= Int(1),
            Btoi(Txn.application_args[3]) <= Int(365)
        )),
        App.globalPut(borrower_key, Txn.sender()),
        App.globalPut(amount_key, Btoi(Txn.application_args[0])),
        App.globalPut(purpose_key, Txn.application_args[1]),
        App.globalPut(interest_rate_key, Btoi(Txn.application_args[2])),
        App.globalPut(duration_key, Btoi(Txn.application_args[3])),
        App.globalPut(status_key, Bytes("pending")),
        App.globalPut(funded_at_key, Int(0)),
        App.globalPut(created_at_key, Global.latest_timestamp()),
        App.globalPut(verification_status_key, Bytes("pending")),
        App.globalPut(risk_score_key, Int(0)),
        Approve()
    ])
    
    # Enhanced funding with additional checks
    fund_investment = Seq([
        Assert(App.globalGet(status_key) == Bytes("pending")),
        Assert(Txn.sender() != App.globalGet(borrower_key)),
        Assert(Gtxn[0].type_enum() == TxnType.Payment),
        Assert(Gtxn[0].amount() == App.globalGet(amount_key)),
        Assert(Gtxn[0].receiver() == App.globalGet(borrower_key)),
        # Calculate repayment amount with interest
        App.globalPut(repayment_amount_key, 
            App.globalGet(amount_key) + 
            (App.globalGet(amount_key) * App.globalGet(interest_rate_key) / Int(100))
        ),
        App.globalPut(investor_key, Txn.sender()),
        App.globalPut(status_key, Bytes("active")),
        App.globalPut(funded_at_key, Global.latest_timestamp()),
        Approve()
    ])
    
    # Enhanced repayment with partial payment support
    make_repayment = Seq([
        Assert(App.globalGet(status_key) == Bytes("active")),
        Assert(Txn.sender() == App.globalGet(borrower_key)),
        Assert(Gtxn[0].type_enum() == TxnType.Payment),
        Assert(Gtxn[0].receiver() == App.globalGet(investor_key)),
        # Allow partial payments
        Assert(Gtxn[0].amount() > Int(0)),
        Approve()
    ])
    
    # Enhanced completion with verification
    complete_investment = Seq([
        Assert(App.globalGet(status_key) == Bytes("active")),
        Assert(Or(
            Txn.sender() == App.globalGet(borrower_key),
            Txn.sender() == App.globalGet(investor_key)
        )),
        App.globalPut(status_key, Bytes("completed")),
        Approve()
    ])
    
    # Enhanced default handling
    default_investment = Seq([
        Assert(App.globalGet(status_key) == Bytes("active")),
        Assert(Txn.sender() == App.globalGet(investor_key)),
        # Check if investment has expired (duration passed)
        Assert(Global.latest_timestamp() > 
            App.globalGet(funded_at_key) + (App.globalGet(duration_key) * Int(86400))),
        App.globalPut(status_key, Bytes("defaulted")),
        Approve()
    ])
    
    # Update user verification status
    update_verification = Seq([
        Assert(Txn.sender() == App.globalGet(borrower_key)),
        App.globalPut(verification_status_key, Txn.application_args[1]),
        Approve()
    ])
    
    # Update risk score
    update_risk_score = Seq([
        Assert(Txn.sender() == App.globalGet(borrower_key)),
        App.globalPut(risk_score_key, Btoi(Txn.application_args[1])),
        Approve()
    ])
    
    # Enhanced investment info retrieval
    get_investment_info = Seq([
        App.globalGet(borrower_key),
        App.globalGet(investor_key),
        App.globalGet(amount_key),
        App.globalGet(purpose_key),
        App.globalGet(interest_rate_key),
        App.globalGet(duration_key),
        App.globalGet(status_key),
        App.globalGet(funded_at_key),
        App.globalGet(repayment_amount_key),
        App.globalGet(risk_score_key),
        App.globalGet(verification_status_key),
        App.globalGet(created_at_key),
        Approve()
    ])
    
    # Emergency pause functionality
    pause_investment = Seq([
        Assert(Or(
            Txn.sender() == App.globalGet(borrower_key),
            Txn.sender() == App.globalGet(investor_key)
        )),
        App.globalPut(status_key, Bytes("paused")),
        Approve()
    ])
    
    # Resume paused investment
    resume_investment = Seq([
        Assert(App.globalGet(status_key) == Bytes("paused")),
        Assert(Or(
            Txn.sender() == App.globalGet(borrower_key),
            Txn.sender() == App.globalGet(investor_key)
        )),
        App.globalPut(status_key, Bytes("active")),
        Approve()
    ])
    
    program = Cond(
        [Txn.application_id() == Int(0), create_investment],
        [Txn.application_args[0] == Bytes("fund"), fund_investment],
        [Txn.application_args[0] == Bytes("repay"), make_repayment],
        [Txn.application_args[0] == Bytes("complete"), complete_investment],
        [Txn.application_args[0] == Bytes("default"), default_investment],
        [Txn.application_args[0] == Bytes("verify"), update_verification],
        [Txn.application_args[0] == Bytes("risk"), update_risk_score],
        [Txn.application_args[0] == Bytes("info"), get_investment_info],
        [Txn.application_args[0] == Bytes("pause"), pause_investment],
        [Txn.application_args[0] == Bytes("resume"), resume_investment]
    )
    
    return program

def clear_state_program():
    return Approve()

if __name__ == "__main__":
    approval_program = investment_contract()
    clear_program = clear_state_program()
    
    compiled_approval = compileTeal(approval_program, Mode.Application, version=6)
    compiled_clear = compileTeal(clear_program, Mode.Application, version=6)
    
    print("Approval Program:")
    print(compiled_approval)
    print("\nClear Program:")
    print(compiled_clear)