from pyteal import *

def investment_contract():
    
    borrower_key = Bytes("borrower")
    investor_key = Bytes("investor")
    amount_key = Bytes("amount")
    purpose_key = Bytes("purpose")
    interest_rate_key = Bytes("interest_rate")
    duration_key = Bytes("duration")
    status_key = Bytes("status")
    funded_at_key = Bytes("funded_at")
    
    create_investment = Seq([
        App.globalPut(borrower_key, Txn.sender()),
        App.globalPut(amount_key, Btoi(Txn.application_args[0])),
        App.globalPut(purpose_key, Txn.application_args[1]),
        App.globalPut(interest_rate_key, Btoi(Txn.application_args[2])),
        App.globalPut(duration_key, Btoi(Txn.application_args[3])),
        App.globalPut(status_key, Bytes("pending")),
        App.globalPut(funded_at_key, Int(0)),
        Approve()
    ])
    
    fund_investment = Seq([
        Assert(App.globalGet(status_key) == Bytes("pending")),
        Assert(Txn.sender() != App.globalGet(borrower_key)),
        Assert(Gtxn[0].type_enum() == TxnType.Payment),
        Assert(Gtxn[0].amount() == App.globalGet(amount_key)),
        Assert(Gtxn[0].receiver() == App.globalGet(borrower_key)),
        App.globalPut(investor_key, Txn.sender()),
        App.globalPut(status_key, Bytes("active")),
        App.globalPut(funded_at_key, Global.latest_timestamp()),
        Approve()
    ])
    
    make_repayment = Seq([
        Assert(App.globalGet(status_key) == Bytes("active")),
        Assert(Txn.sender() == App.globalGet(borrower_key)),
        Assert(Gtxn[0].type_enum() == TxnType.Payment),
        Assert(Gtxn[0].receiver() == App.globalGet(investor_key)),
        Approve()
    ])
    
    complete_investment = Seq([
        Assert(App.globalGet(status_key) == Bytes("active")),
        Assert(Or(
            Txn.sender() == App.globalGet(borrower_key),
            Txn.sender() == App.globalGet(investor_key)
        )),
        App.globalPut(status_key, Bytes("completed")),
        Approve()
    ])
    
    default_investment = Seq([
        Assert(App.globalGet(status_key) == Bytes("active")),
        Assert(Txn.sender() == App.globalGet(investor_key)),
        App.globalPut(status_key, Bytes("defaulted")),
        Approve()
    ])
    
    get_investment_info = Seq([
        App.globalGet(borrower_key),
        App.globalGet(investor_key),
        App.globalGet(amount_key),
        App.globalGet(purpose_key),
        App.globalGet(interest_rate_key),
        App.globalGet(duration_key),
        App.globalGet(status_key),
        App.globalGet(funded_at_key),
        Approve()
    ])
    
    program = Cond(
        [Txn.application_id() == Int(0), create_investment],
        [Txn.application_args[0] == Bytes("fund"), fund_investment],
        [Txn.application_args[0] == Bytes("repay"), make_repayment],
        [Txn.application_args[0] == Bytes("complete"), complete_investment],
        [Txn.application_args[0] == Bytes("default"), default_investment],
        [Txn.application_args[0] == Bytes("info"), get_investment_info]
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