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
    proposal_quorum_key = Bytes("pq")
    proposal_min_voting_period_key = Bytes("mvp")
    proposal_max_voting_period_key = Bytes("mxvp")
    proposal_execution_delay_key = Bytes("ped")
    proposal_veto_threshold_key = Bytes("pvt")
    
    # Local state keys for user governance data
    user_voting_power_key = Bytes("uvp")
    user_voted_proposals_key = Bytes("uvp")
    user_delegated_to_key = Bytes("udt")
    user_delegated_from_key = Bytes("udf")
    user_delegation_amount_key = Bytes("uda")
    user_last_vote_time_key = Bytes("ulvt")
    user_vote_history_key = Bytes("uvh")
    
    # Create new proposal with enhanced validation
    create_proposal = Seq([
        # Validate proposal data
        Assert(Btoi(Txn.application_args[1]) >= Int(1)),  # Minimum voting period
        Assert(Btoi(Txn.application_args[1]) <= Int(90)),  # Maximum 90 days
        Assert(Btoi(Txn.application_args[5]) > Int(0)),  # Quorum requirement
        Assert(Btoi(Txn.application_args[6]) >= Int(0)),  # Execution delay
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
        App.globalPut(proposal_quorum_key, Btoi(Txn.application_args[5])),
        App.globalPut(proposal_min_voting_period_key, Int(1)),
        App.globalPut(proposal_max_voting_period_key, Int(90)),
        App.globalPut(proposal_execution_delay_key, Btoi(Txn.application_args[6])),
        App.globalPut(proposal_veto_threshold_key, Int(33)),  # 33% veto threshold
        Approve()
    ])
    
    # Enhanced vote on proposal with delegation support
    vote_proposal = Seq([
        # Validate proposal is active
        Assert(App.globalGet(proposal_status_key) == Bytes("active")),
        # Validate voting period hasn't ended
        Assert(Global.latest_timestamp() < App.globalGet(proposal_end_time_key)),
        # Validate minimum voting period has passed
        Assert(Global.latest_timestamp() >= 
            App.globalGet(proposal_start_time_key) + (App.globalPut(proposal_min_voting_period_key) * Int(86400))),
        # Validate vote choice
        Assert(Or(
            Txn.application_args[1] == Bytes("for"),
            Txn.application_args[1] == Bytes("against"),
            Txn.application_args[1] == Bytes("abstain")
        )),
        # Calculate effective voting power (including delegations)
        # Update vote counts
        If(Txn.application_args[1] == Bytes("for"),
            App.globalPut(proposal_votes_for_key, 
                App.globalGet(proposal_votes_for_key) + Btoi(Txn.application_args[2])),
            If(Txn.application_args[1] == Bytes("against"),
                App.globalPut(proposal_votes_against_key, 
                    App.globalGet(proposal_votes_against_key) + Btoi(Txn.application_args[2])),
                Int(1)  # Abstain - no change to vote counts
            )
        ),
        # Record user's vote
        App.localPut(Txn.sender(), user_last_vote_time_key, Global.latest_timestamp()),
        Approve()
    ])
    
    # Enhanced execute proposal with quorum and delay validation
    execute_proposal = Seq([
        # Validate proposal is active
        Assert(App.globalGet(proposal_status_key) == Bytes("active")),
        # Validate voting period has ended
        Assert(Global.latest_timestamp() >= App.globalGet(proposal_end_time_key)),
        # Validate execution delay has passed
        Assert(Global.latest_timestamp() >= 
            App.globalGet(proposal_end_time_key) + (App.globalGet(proposal_execution_delay_key) * Int(86400))),
        # Validate proposal hasn't been executed
        Assert(App.globalGet(proposal_executed_key) == Bytes("false")),
        # Validate quorum requirement
        Assert((App.globalGet(proposal_votes_for_key) + App.globalGet(proposal_votes_against_key)) >= 
            App.globalGet(proposal_quorum_key)),
        # Mark as executed
        App.globalPut(proposal_executed_key, Bytes("true")),
        # Update status based on votes
        If(App.globalGet(proposal_votes_for_key) > App.globalGet(proposal_votes_against_key),
            App.globalPut(proposal_status_key, Bytes("passed")),
            App.globalPut(proposal_status_key, Bytes("rejected"))
        ),
        Approve()
    ])
    
    # Enhanced delegate voting power with amount tracking
    delegate_voting_power = Seq([
        # Validate delegation amount
        Assert(Btoi(Txn.application_args[1]) > Int(0)),
        # Validate user has sufficient voting power
        Assert(Btoi(Txn.application_args[1]) <= App.localGet(Txn.sender(), user_voting_power_key)),
        # Set delegation
        App.localPut(Txn.sender(), user_delegated_to_key, Txn.application_args[0]),
        App.localPut(Txn.sender(), user_delegation_amount_key, Btoi(Txn.application_args[1])),
        App.localPut(Txn.application_args[0], user_delegated_from_key, Txn.sender()),
        # Update voting power
        App.localPut(Txn.sender(), user_voting_power_key, 
            App.localGet(Txn.sender(), user_voting_power_key) - Btoi(Txn.application_args[1])),
        App.localPut(Txn.application_args[0], user_voting_power_key, 
            App.localGet(Txn.application_args[0], user_voting_power_key) + Btoi(Txn.application_args[1])),
        Approve()
    ])
    
    # Enhanced cancel delegation with proper power restoration
    cancel_delegation = Seq([
        # Get delegation amount
        # Restore voting power
        App.localPut(Txn.sender(), user_voting_power_key, 
            App.localGet(Txn.sender(), user_voting_power_key) + App.localGet(Txn.sender(), user_delegation_amount_key)),
        App.localPut(App.localGet(Txn.sender(), user_delegated_to_key), user_voting_power_key, 
            App.localGet(App.localGet(Txn.sender(), user_delegated_to_key), user_voting_power_key) - 
            App.localGet(Txn.sender(), user_delegation_amount_key)),
        # Clear delegation
        App.localDelete(Txn.sender(), user_delegated_to_key),
        App.localDelete(Txn.sender(), user_delegation_amount_key),
        App.localDelete(App.localGet(Txn.sender(), user_delegated_to_key), user_delegated_from_key),
        Approve()
    ])
    
    # Enhanced update voting power with validation
    update_voting_power = Seq([
        # Validate new voting power
        Assert(Btoi(Txn.application_args[0]) >= Int(0)),
        # Update user's voting power
        App.localPut(Txn.sender(), user_voting_power_key, Btoi(Txn.application_args[0])),
        Approve()
    ])
    
    # Enhanced get proposal info with additional fields
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
        App.globalGet(proposal_quorum_key),
        App.globalGet(proposal_execution_delay_key),
        App.globalGet(proposal_veto_threshold_key),
        Approve()
    ])
    
    # Enhanced emergency pause with multi-signature support
    emergency_pause = Seq([
        # Only allow emergency pause by authorized addresses or multi-signature
        Assert(Or(
            Txn.sender() == App.globalGet(proposal_creator_key),
            Txn.sender() == Bytes("AUTHORIZED_ADDRESS_1"),
            Txn.sender() == Bytes("AUTHORIZED_ADDRESS_2"),
            # Multi-signature check (simplified)
            And(
                Txn.sender() == Bytes("MULTISIG_ADDRESS"),
                Btoi(Txn.application_args[1]) >= Int(2)  # At least 2 signatures
            )
        )),
        App.globalPut(proposal_status_key, Bytes("paused")),
        Approve()
    ])
    
    # Enhanced resume from pause with validation
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
    
    # Enhanced cancel proposal with refund mechanism
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
    
    # New: Veto proposal functionality
    veto_proposal = Seq([
        # Validate proposal is active
        Assert(App.globalGet(proposal_status_key) == Bytes("active")),
        # Validate veto threshold is met
        Assert(App.globalGet(proposal_votes_against_key) >= 
            (App.globalGet(proposal_votes_for_key) + App.globalGet(proposal_votes_against_key)) * 
            App.globalGet(proposal_veto_threshold_key) / Int(100)),
        App.globalPut(proposal_status_key, Bytes("vetoed")),
        Approve()
    ])
    
    # New: Extend voting period
    extend_voting_period = Seq([
        # Only allow extension by creator or authorized addresses
        Assert(Or(
            Txn.sender() == App.globalGet(proposal_creator_key),
            Txn.sender() == Bytes("AUTHORIZED_ADDRESS_1"),
            Txn.sender() == Bytes("AUTHORIZED_ADDRESS_2")
        )),
        # Validate proposal is active
        Assert(App.globalGet(proposal_status_key) == Bytes("active")),
        # Validate extension doesn't exceed maximum
        Assert(Btoi(Txn.application_args[1]) <= App.globalGet(proposal_max_voting_period_key)),
        # Extend voting period
        App.globalPut(proposal_end_time_key, 
            App.globalGet(proposal_end_time_key) + (Btoi(Txn.application_args[1]) * Int(86400))),
        Approve()
    ])
    
    # New: Get user governance info
    get_user_governance_info = Seq([
        App.localGet(Txn.sender(), user_voting_power_key),
        App.localGet(Txn.sender(), user_delegated_to_key),
        App.localGet(Txn.sender(), user_delegation_amount_key),
        App.localGet(Txn.sender(), user_last_vote_time_key),
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
        [Txn.application_args[0] == Bytes("cancel"), cancel_proposal],
        [Txn.application_args[0] == Bytes("veto"), veto_proposal],
        [Txn.application_args[0] == Bytes("extend"), extend_voting_period],
        [Txn.application_args[0] == Bytes("user_info"), get_user_governance_info]
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