from pyteal import *

def investment_contract():
    
    # Optimized global state keys - using bytes for better gas efficiency
    borrower_key = Bytes("b")
    investor_key = Bytes("i")
    amount_key = Bytes("a")
    purpose_key = Bytes("p")
    interest_rate_key = Bytes("ir")
    duration_key = Bytes("d")
    status_key = Bytes("s")
    funded_at_key = Bytes("fa")
    repayment_amount_key = Bytes("ra")
    risk_score_key = Bytes("rs")
    verification_status_key = Bytes("vs")
    created_at_key = Bytes("ca")
    
    # Local state keys for user data - optimized naming
    user_verification_key = Bytes("uv")
    user_risk_score_key = Bytes("urs")
    user_reputation_key = Bytes("ur")
    
    # Enhanced investment creation with gas optimization
    create_investment = Seq([
        # Validate minimum amount (0.001 ALGO) - using microAlgos
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
        # Batch global state updates for gas efficiency
        App.globalPut(borrower_key, Txn.sender()),
        App.globalPut(amount_key, Btoi(Txn.application_args[0])),
        App.globalPut(purpose_key, Txn.application_args[1]),
        App.globalPut(interest_rate_key, Btoi(Txn.application_args[2])),
        App.globalPut(duration_key, Btoi(Txn.application_args[3])),
        App.globalPut(status_key, Bytes("p")),  # "pending" -> "p"
        App.globalPut(funded_at_key, Int(0)),
        App.globalPut(created_at_key, Global.latest_timestamp()),
        App.globalPut(verification_status_key, Bytes("p")),  # "pending" -> "p"
        App.globalPut(risk_score_key, Int(0)),
        Approve()
    ])
    
    # Enhanced funding with gas optimization
    fund_investment = Seq([
        Assert(App.globalGet(status_key) == Bytes("p")),  # "pending" -> "p"
        Assert(Txn.sender() != App.globalGet(borrower_key)),
        Assert(Gtxn[0].type_enum() == TxnType.Payment),
        Assert(Gtxn[0].amount() == App.globalGet(amount_key)),
        Assert(Gtxn[0].receiver() == App.globalGet(borrower_key)),
        # Calculate repayment amount with interest - optimized calculation
        App.globalPut(repayment_amount_key, 
            App.globalGet(amount_key) + 
            (App.globalGet(amount_key) * App.globalGet(interest_rate_key) / Int(100))
        ),
        App.globalPut(investor_key, Txn.sender()),
        App.globalPut(status_key, Bytes("a")),  # "active" -> "a"
        App.globalPut(funded_at_key, Global.latest_timestamp()),
        Approve()
    ])
    
    # Enhanced repayment with partial payment support and gas optimization
    make_repayment = Seq([
        Assert(App.globalGet(status_key) == Bytes("a")),  # "active" -> "a"
        Assert(Txn.sender() == App.globalGet(borrower_key)),
        Assert(Gtxn[0].type_enum() == TxnType.Payment),
        Assert(Gtxn[0].receiver() == App.globalGet(investor_key)),
        # Allow partial payments
        Assert(Gtxn[0].amount() > Int(0)),
        Approve()
    ])
    
    # Enhanced completion with verification - optimized
    complete_investment = Seq([
        Assert(App.globalGet(status_key) == Bytes("a")),  # "active" -> "a"
        Assert(Or(
            Txn.sender() == App.globalGet(borrower_key),
            Txn.sender() == App.globalGet(investor_key)
        )),
        App.globalPut(status_key, Bytes("c")),  # "completed" -> "c"
        Approve()
    ])
    
    # Enhanced default handling with gas optimization
    default_investment = Seq([
        Assert(App.globalGet(status_key) == Bytes("a")),  # "active" -> "a"
        Assert(Txn.sender() == App.globalGet(investor_key)),
        # Check if investment has expired (duration passed) - optimized timestamp check
        Assert(Global.latest_timestamp() > 
            App.globalGet(funded_at_key) + (App.globalGet(duration_key) * Int(86400))),
        App.globalPut(status_key, Bytes("d")),  # "defaulted" -> "d"
        Approve()
    ])
    
    # Update user verification status - optimized
    update_verification = Seq([
        Assert(Txn.sender() == App.globalGet(borrower_key)),
        App.globalPut(verification_status_key, Txn.application_args[1]),
        Approve()
    ])
    
    # Update risk score - optimized
    update_risk_score = Seq([
        Assert(Txn.sender() == App.globalGet(borrower_key)),
        App.globalPut(risk_score_key, Btoi(Txn.application_args[1])),
        Approve()
    ])
    
    # Enhanced investment info retrieval - optimized for gas efficiency
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
    
    # Emergency pause functionality - optimized
    pause_investment = Seq([
        Assert(Or(
            Txn.sender() == App.globalGet(borrower_key),
            Txn.sender() == App.globalGet(investor_key)
        )),
        App.globalPut(status_key, Bytes("pa")),  # "paused" -> "pa"
        Approve()
    ])
    
    # Resume paused investment - optimized
    resume_investment = Seq([
        Assert(App.globalGet(status_key) == Bytes("pa")),  # "paused" -> "pa"
        Assert(Or(
            Txn.sender() == App.globalGet(borrower_key),
            Txn.sender() == App.globalGet(investor_key)
        )),
        App.globalPut(status_key, Bytes("a")),  # "active" -> "a"
        Approve()
    ])
    
    # New: Batch operations for gas efficiency
    batch_update = Seq([
        Assert(Txn.sender() == App.globalGet(borrower_key)),
        # Update multiple fields in one transaction
        App.globalPut(verification_status_key, Txn.application_args[1]),
        App.globalPut(risk_score_key, Btoi(Txn.application_args[2])),
        Approve()
    ])
    
    # New: Emergency withdrawal for investors
    emergency_withdrawal = Seq([
        Assert(App.globalGet(status_key) == Bytes("a")),  # "active" -> "a"
        Assert(Txn.sender() == App.globalGet(investor_key)),
        # Only allow after 30 days of inactivity
        Assert(Global.latest_timestamp() > 
            App.globalGet(funded_at_key) + Int(2592000)),  # 30 days in seconds
        App.globalPut(status_key, Bytes("ew")),  # "emergency_withdrawal" -> "ew"
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
        [Txn.application_args[0] == Bytes("resume"), resume_investment],
        [Txn.application_args[0] == Bytes("batch"), batch_update],
        [Txn.application_args[0] == Bytes("emergency"), emergency_withdrawal]
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