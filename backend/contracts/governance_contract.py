"""
Algorand Smart Contract for Governance
This contract handles voting on platform proposals and governance decisions.
"""

from pyteal import *

# Global state keys
PROPOSAL_ID = Bytes("proposal_id")
PROPOSAL_TITLE = Bytes("proposal_title")
PROPOSAL_DESCRIPTION = Bytes("proposal_description")
PROPOSAL_CREATOR = Bytes("proposal_creator")
PROPOSAL_STATUS = Bytes("proposal_status")
VOTING_START = Bytes("voting_start")
VOTING_END = Bytes("voting_end")
YES_VOTES = Bytes("yes_votes")
NO_VOTES = Bytes("no_votes")
TOTAL_VOTES = Bytes("total_votes")
QUORUM_THRESHOLD = Bytes("quorum_threshold")
MAJORITY_THRESHOLD = Bytes("majority_threshold")

# Status constants
DRAFT = Int(0)
ACTIVE = Int(1)
PASSED = Int(2)
REJECTED = Int(3)
EXPIRED = Int(4)

def governance_contract():
    """Main governance contract logic"""
    
    # On creation, initialize governance parameters
    on_creation = Seq([
        # Set governance parameters
        App.globalPut(QUORUM_THRESHOLD, Int(1000)),  # Minimum votes required
        App.globalPut(MAJORITY_THRESHOLD, Int(51)),  # 51% majority required
        
        # Initialize proposal counters
        App.globalPut(PROPOSAL_ID, Int(0)),
        App.globalPut(YES_VOTES, Int(0)),
        App.globalPut(NO_VOTES, Int(0)),
        App.globalPut(TOTAL_VOTES, Int(0)),
        
        Approve()
    ])
    
    # Create a new proposal
    def create_proposal():
        return Seq([
            # Get new proposal ID
            App.globalPut(PROPOSAL_ID, App.globalGet(PROPOSAL_ID) + Int(1)),
            
            # Set proposal details
            App.globalPut(PROPOSAL_TITLE, Txn.application_args[1]),
            App.globalPut(PROPOSAL_DESCRIPTION, Txn.application_args[2]),
            App.globalPut(PROPOSAL_CREATOR, Txn.sender()),
            App.globalPut(PROPOSAL_STATUS, DRAFT),
            
            # Set voting period (7 days from now)
            App.globalPut(VOTING_START, Global.latest_timestamp()),
            App.globalPut(VOTING_END, Global.latest_timestamp() + Int(604800)),  # 7 days
            
            # Reset vote counts
            App.globalPut(YES_VOTES, Int(0)),
            App.globalPut(NO_VOTES, Int(0)),
            App.globalPut(TOTAL_VOTES, Int(0)),
            
            Approve()
        ])
    
    # Start voting on a proposal
    def start_voting():
        return Seq([
            # Check if proposal is in draft status
            Assert(App.globalGet(PROPOSAL_STATUS) == DRAFT),
            
            # Check if sender is proposal creator
            Assert(Txn.sender() == App.globalGet(PROPOSAL_CREATOR)),
            
            # Start voting
            App.globalPut(PROPOSAL_STATUS, ACTIVE),
            App.globalPut(VOTING_START, Global.latest_timestamp()),
            
            Approve()
        ])
    
    # Vote on a proposal
    def vote():
        vote_choice = Btoi(Txn.application_args[1])  # 0 = No, 1 = Yes
        
        return Seq([
            # Check if proposal is active
            Assert(App.globalGet(PROPOSAL_STATUS) == ACTIVE),
            
            # Check if voting period is still open
            Assert(Global.latest_timestamp() < App.globalGet(VOTING_END)),
            
            # Check if user hasn't voted before (simplified - in real implementation, use local state)
            # For now, we'll allow multiple votes (this should be improved with local state)
            
            # Update vote counts
            If(vote_choice == Int(1))
            .Then(App.globalPut(YES_VOTES, App.globalGet(YES_VOTES) + Int(1)))
            .Else(App.globalPut(NO_VOTES, App.globalGet(NO_VOTES) + Int(1))),
            
            App.globalPut(TOTAL_VOTES, App.globalGet(TOTAL_VOTES) + Int(1)),
            
            Approve()
        ])
    
    # Execute proposal results
    def execute_proposal():
        return Seq([
            # Check if proposal is active
            Assert(App.globalGet(PROPOSAL_STATUS) == ACTIVE),
            
            # Check if voting period has ended
            Assert(Global.latest_timestamp() >= App.globalGet(VOTING_END)),
            
            # Check quorum
            If(App.globalGet(TOTAL_VOTES) >= App.globalGet(QUORUM_THRESHOLD))
            .Then(Seq([
                # Check majority
                If(App.globalGet(YES_VOTES) * Int(100) / App.globalGet(TOTAL_VOTES) >= App.globalGet(MAJORITY_THRESHOLD))
                .Then(App.globalPut(PROPOSAL_STATUS, PASSED))
                .Else(App.globalPut(PROPOSAL_STATUS, REJECTED))
            ]))
            .Else(App.globalPut(PROPOSAL_STATUS, EXPIRED)),
            
            Approve()
        ])
    
    # Get proposal details
    def get_proposal():
        return Seq([
            # Return proposal information
            # This would typically return data to the caller
            Approve()
        ])
    
    # Update governance parameters
    def update_parameters():
        return Seq([
            # Check if sender is authorized (simplified - should check admin role)
            # For now, allow any user to update parameters
            
            # Update quorum threshold
            App.globalPut(QUORUM_THRESHOLD, Btoi(Txn.application_args[1])),
            
            # Update majority threshold
            App.globalPut(MAJORITY_THRESHOLD, Btoi(Txn.application_args[2])),
            
            Approve()
        ])
    
    # Main router
    def handle_noop():
        return Cond(
            [Txn.application_args[0] == Bytes("create"), create_proposal()],
            [Txn.application_args[0] == Bytes("start_voting"), start_voting()],
            [Txn.application_args[0] == Bytes("vote"), vote()],
            [Txn.application_args[0] == Bytes("execute"), execute_proposal()],
            [Txn.application_args[0] == Bytes("get_proposal"), get_proposal()],
            [Txn.application_args[0] == Bytes("update_params"), update_parameters()]
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
    with open("governance_contract.teal", "w") as f:
        f.write(compileTeal(governance_contract(), Mode.Application))