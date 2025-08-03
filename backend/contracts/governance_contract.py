from pyteal import *

def governance_contract():
    
    # Global state keys for governance
    proposal_id_key = Bytes("pid")
    proposal_creator_key = Bytes("pcr")
    proposal_title_key = Bytes("ptl")
    proposal_description_key = Bytes("pds")
    proposal_type_key = Bytes("pty")
    proposal_status_key = Bytes("pst")
    proposal_votes_for_key = Bytes("pvf")
    proposal_votes_against_key = Bytes("pva")
    proposal_start_time_key = Bytes("pst")
    proposal_end_time_key = Bytes("pet")
    proposal_executed_key = Bytes("pex")
    
    # Local state keys for user governance data
    user_voting_power_key = Bytes("uvp")
    user_voted_proposals_key = Bytes("uvp")
    user_delegated_to_key = Bytes("udt")
    user_delegated_from_key = Bytes("udf")
    
    # Create new proposal
    create_proposal = Seq([
        # Validate proposal data
        Assert(Btoi(Txn.application_args[1]) > Int(0)),  # Minimum voting period
        Assert(Btoi(Txn.application_args[1]) <= Int(30)),  # Maximum 30 days
        # Set proposal data
        App.globalPut(proposal_id_key, Btoi(Txn.application_args[0])),
        App.globalPut(proposal_creator_key, Txn.sender()),
        App.globalPut(proposal_title_key, Txn.application_args[2]),
        App.globalPut(proposal_description_key, Txn.application_args[3]),
        App.globalPut(proposal_type_key, Txn.application_args[4]),
        App.globalPut(proposal_status_key, Bytes("active")),
        App.globalPut(proposal_votes_for_key, Int(0)),
        App.globalPut(proposal_votes_against_key, Int(0)),
        App.globalPut(proposal_start_time_key, Global.latest_timestamp()),
        App.globalPut(proposal_end_time_key, 
            Global.latest_timestamp() + (Btoi(Txn.application_args[1]) * Int(86400))),
        App.globalPut(proposal_executed_key, Bytes("false")),
        Approve()
    ])
    
    # Vote on proposal
    vote_proposal = Seq([
        # Validate proposal is active
        Assert(App.globalGet(proposal_status_key) == Bytes("active")),
        # Validate voting period hasn't ended
        Assert(Global.latest_timestamp() < App.globalGet(proposal_end_time_key)),
        # Validate vote choice
        Assert(Or(
            Txn.application_args[1] == Bytes("for"),
            Txn.application_args[1] == Bytes("against")
        )),
        # Update vote counts
        If(Txn.application_args[1] == Bytes("for"),
            App.globalPut(proposal_votes_for_key, 
                App.globalGet(proposal_votes_for_key) + Btoi(Txn.application_args[2])),
            App.globalPut(proposal_votes_against_key, 
                App.globalGet(proposal_votes_against_key) + Btoi(Txn.application_args[2]))
        ),
        Approve()
    ])
    
    # Execute proposal
    execute_proposal = Seq([
        # Validate proposal is active
        Assert(App.globalGet(proposal_status_key) == Bytes("active")),
        # Validate voting period has ended
        Assert(Global.latest_timestamp() >= App.globalGet(proposal_end_time_key)),
        # Validate proposal hasn't been executed
        Assert(App.globalGet(proposal_executed_key) == Bytes("false")),
        # Mark as executed
        App.globalPut(proposal_executed_key, Bytes("true")),
        # Update status based on votes
        If(App.globalGet(proposal_votes_for_key) > App.globalGet(proposal_votes_against_key),
            App.globalPut(proposal_status_key, Bytes("passed")),
            App.globalPut(proposal_status_key, Bytes("rejected"))
        ),
        Approve()
    ])
    
    # Delegate voting power
    delegate_voting_power = Seq([
        # Validate delegation amount
        Assert(Btoi(Txn.application_args[1]) > Int(0)),
        # Set delegation
        App.localPut(Txn.sender(), user_delegated_to_key, Txn.application_args[0]),
        App.localPut(Txn.application_args[0], user_delegated_from_key, Txn.sender()),
        Approve()
    ])
    
    # Cancel delegation
    cancel_delegation = Seq([
        # Clear delegation
        App.localDelete(Txn.sender(), user_delegated_to_key),
        App.localDelete(Txn.application_args[0], user_delegated_from_key),
        Approve()
    ])
    
    # Update voting power
    update_voting_power = Seq([
        # Update user's voting power
        App.localPut(Txn.sender(), user_voting_power_key, Btoi(Txn.application_args[0])),
        Approve()
    ])
    
    # Get proposal info
    get_proposal_info = Seq([
        App.globalGet(proposal_id_key),
        App.globalGet(proposal_creator_key),
        App.globalGet(proposal_title_key),
        App.globalGet(proposal_description_key),
        App.globalGet(proposal_type_key),
        App.globalGet(proposal_status_key),
        App.globalGet(proposal_votes_for_key),
        App.globalGet(proposal_votes_against_key),
        App.globalGet(proposal_start_time_key),
        App.globalGet(proposal_end_time_key),
        App.globalGet(proposal_executed_key),
        Approve()
    ])
    
    # Emergency pause
    emergency_pause = Seq([
        # Only allow emergency pause by authorized addresses
        Assert(Or(
            Txn.sender() == App.globalGet(proposal_creator_key),
            # Add other authorized addresses here
            Txn.sender() == Bytes("AUTHORIZED_ADDRESS_1"),
            Txn.sender() == Bytes("AUTHORIZED_ADDRESS_2")
        )),
        App.globalPut(proposal_status_key, Bytes("paused")),
        Approve()
    ])
    
    # Resume from pause
    resume_proposal = Seq([
        # Only allow resume by authorized addresses
        Assert(Or(
            Txn.sender() == App.globalGet(proposal_creator_key),
            Txn.sender() == Bytes("AUTHORIZED_ADDRESS_1"),
            Txn.sender() == Bytes("AUTHORIZED_ADDRESS_2")
        )),
        Assert(App.globalGet(proposal_status_key) == Bytes("paused")),
        App.globalPut(proposal_status_key, Bytes("active")),
        Approve()
    ])
    
    # Cancel proposal
    cancel_proposal = Seq([
        # Only allow cancellation by creator or authorized addresses
        Assert(Or(
            Txn.sender() == App.globalGet(proposal_creator_key),
            Txn.sender() == Bytes("AUTHORIZED_ADDRESS_1"),
            Txn.sender() == Bytes("AUTHORIZED_ADDRESS_2")
        )),
        Assert(App.globalGet(proposal_status_key) == Bytes("active")),
        App.globalPut(proposal_status_key, Bytes("cancelled")),
        Approve()
    ])
    
    program = Cond(
        [Txn.application_id() == Int(0), create_proposal],
        [Txn.application_args[0] == Bytes("vote"), vote_proposal],
        [Txn.application_args[0] == Bytes("execute"), execute_proposal],
        [Txn.application_args[0] == Bytes("delegate"), delegate_voting_power],
        [Txn.application_args[0] == Bytes("cancel_delegation"), cancel_delegation],
        [Txn.application_args[0] == Bytes("update_power"), update_voting_power],
        [Txn.application_args[0] == Bytes("info"), get_proposal_info],
        [Txn.application_args[0] == Bytes("pause"), emergency_pause],
        [Txn.application_args[0] == Bytes("resume"), resume_proposal],
        [Txn.application_args[0] == Bytes("cancel"), cancel_proposal]
    )
    
    return program

def clear_state_program():
    return Approve()

if __name__ == "__main__":
    approval_program = governance_contract()
    clear_program = clear_state_program()
    
    compiled_approval = compileTeal(approval_program, Mode.Application, version=6)
    compiled_clear = compileTeal(clear_program, Mode.Application, version=6)
    
    print("Governance Approval Program:")
    print(compiled_approval)
    print("\nGovernance Clear Program:")
    print(compiled_clear) 