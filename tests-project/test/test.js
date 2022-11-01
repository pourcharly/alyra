const constants = require('@openzeppelin/test-helpers/src/constants');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Voting = artifacts.require("Voting");

contract("Voting", accounts => {
    console.log()
});

contract("Voting", accounts => {
    const [owner, unregisteredUser, registeredVoter1, registeredVoter2, registeredVoter3] = accounts;
    const WorkflowStatus = {
        RegisteringVoters: BN(Voting.WorkflowStatus.RegisteringVoters),
        ProposalsRegistrationStarted: BN(Voting.WorkflowStatus.ProposalsRegistrationStarted),
        ProposalsRegistrationEnded: BN(Voting.WorkflowStatus.ProposalsRegistrationEnded),
        VotingSessionStarted: BN(Voting.WorkflowStatus.VotingSessionStarted),
        VotingSessionEnded: BN(Voting.WorkflowStatus.VotingSessionEnded),
        VotesTallied: BN(Voting.WorkflowStatus.VotesTallied),
    };
    const testProposal = 'proposal test';
    const emptyProposal = ''

    let votingInstance;


    beforeEach(async () => {
        votingInstance = await Voting.new({ from: owner});
    });
    
    it('first workflow is RegisteringVoters', async () => {
        expect(await votingInstance.workflowStatus()).to.be.bignumber.equal(WorkflowStatus.RegisteringVoters);
    });

    describe('STATUS: Registering Voters', () => {
        it('register a voter', async () => {
            await votingInstance.addVoter(unregisteredUser);
            expect((await votingInstance.getVoter(unregisteredUser, { from: unregisteredUser })).isRegistered).to.equal(true);
        });
        it('emit event VoterRegistered', async () => {
            expectEvent(await votingInstance.addVoter(unregisteredUser), 'VoterRegistered', { voterAddress: unregisteredUser });
        });

        describe('With voters registered', async () => {
            beforeEach(async () => {
                await votingInstance.addVoter(registeredVoter1);
                await votingInstance.addVoter(registeredVoter2);
                await votingInstance.addVoter(registeredVoter3);
            });

            it('only owner can register voter', async () => {
                await expectRevert(
                    votingInstance.addVoter(unregisteredUser, { from: unregisteredUser }),
                    'Ownable: caller is not the owner'
                );
                await expectRevert(
                    votingInstance.addVoter(unregisteredUser, { from: registeredVoter1 }),
                    'Ownable: caller is not the owner'
                );
            });
            it('cannot register voter twice', async () => {
                await expectRevert(
                    votingInstance.addVoter(registeredVoter1),
                    'Already registered'
                );
            });
            it('cannot add proposal yet', async () => {
                await expectRevert(
                    votingInstance.addProposal(testProposal, { from: registeredVoter1 }),
                    'Proposals are not allowed yet'
                );
            });
            it('cannot vote yet', async () => {
                await expectRevert(
                    votingInstance.setVote(1, { from: registeredVoter1 }),
                    'Voting session havent started yet'
                );
            });
            it('start proposals registering', async () => {
                await votingInstance.startProposalsRegistering();
                expect(await votingInstance.workflowStatus()).to.be.bignumber.equal(WorkflowStatus.ProposalsRegistrationStarted);
            });
            it('emit event WorkflowStatusChange on start proposals registering', async () => {
                expectEvent(await votingInstance.startProposalsRegistering(), 'WorkflowStatusChange', { previousStatus: WorkflowStatus.RegisteringVoters, newStatus: WorkflowStatus.ProposalsRegistrationStarted });
            });
        
            describe('STATUS: Registering Proposals Started', async => {
                beforeEach(async () => {
                    await votingInstance.startProposalsRegistering();
                });

                it('cannot register voter after RegisteringVoters status passed', async () => {
                    await expectRevert(
                        votingInstance.addVoter(unregisteredUser),
                        'Voters registration is not open yet'
                    );
                });
                it('exists GENESIS proposal', async () => {
                    expect((await votingInstance.getOneProposal(0, { from: registeredVoter1 })).description).to.equal('GENESIS');
                });
                it('add proposal', async () => {
                    await votingInstance.addProposal(testProposal, { from: registeredVoter1 });
                    expect((await votingInstance.getOneProposal(1, { from: registeredVoter1 })).description).to.equal(testProposal);
                });
                it('emit event ProposalRegistered', async () => {
                    expectEvent(await votingInstance.addProposal(testProposal, { from: registeredVoter1 }), 'ProposalRegistered', { proposalId: BN(1) });
                });
                it('cannot add empty proposal', async () => {
                    await expectRevert(
                        votingInstance.addProposal(emptyProposal, { from: registeredVoter1 }),
                        'Vous ne pouvez pas ne rien proposer'
                    );
                });
                it('only voter can add proposal', async () => {
                    await expectRevert(
                        votingInstance.addProposal(testProposal, { from: unregisteredUser }),
                        'You\'re not a voter'
                    );
                });
                it('cannot vote yet', async () => {
                    await expectRevert(
                        votingInstance.setVote(1, { from: registeredVoter1 }),
                        'Voting session havent started yet'
                    );
                });

                describe('With proposals added', async => {
                    beforeEach(async () => {
                        await votingInstance.addProposal('proposal 1', { from: registeredVoter1 });
                        await votingInstance.addProposal('proposal 2', { from: registeredVoter2 });
                        await votingInstance.addProposal('proposal 3', { from: registeredVoter3 });
                    });

                    it('end proposals registering', async () => {
                        await votingInstance.endProposalsRegistering();
                        expect(await votingInstance.workflowStatus()).to.be.bignumber.equal(WorkflowStatus.ProposalsRegistrationEnded);
                    });
                    it('emit event WorkflowStatusChange on end proposals registering', async () => {
                        expectEvent(await votingInstance.endProposalsRegistering(), 'WorkflowStatusChange', { previousStatus: WorkflowStatus.ProposalsRegistrationStarted, newStatus: WorkflowStatus.ProposalsRegistrationEnded });
                    });
        
                    describe('STATUS: Registering Proposal Ended', async () =>{
                        beforeEach(async () => {
                            await votingInstance.endProposalsRegistering();
                        });

                        it('cannot register voter after RegisteringVoters status passed', async () => {
                            await expectRevert(
                                votingInstance.addVoter(unregisteredUser),
                                'Voters registration is not open yet'
                            );
                        });
                        it('cannot add proposal yet', async () => {
                            await expectRevert(
                                votingInstance.addProposal(testProposal, { from: registeredVoter1 }),
                                'Proposals are not allowed yet'
                            );
                        });
                        it('cannot vote yet', async () => {
                            await expectRevert(
                                votingInstance.setVote(1, { from: registeredVoter1 }),
                                'Voting session havent started yet'
                            );
                        });
                        it('start voting session', async () => {
                            await votingInstance.startVotingSession();
                            expect(await votingInstance.workflowStatus()).to.be.bignumber.equal(WorkflowStatus.VotingSessionStarted);
                        });
                        it('emit event WorkflowStatusChange on start voting session', async () => {
                            expectEvent(await votingInstance.startVotingSession(), 'WorkflowStatusChange', { previousStatus: WorkflowStatus.ProposalsRegistrationEnded, newStatus: WorkflowStatus.VotingSessionStarted });
                        });
            
                        describe('STATUS: Voting Session Started', async => {
                            beforeEach(async () => {
                                await votingInstance.startVotingSession();
                            });
            
                            it('cannot register voter after RegisteringVoters status passed', async () => {
                                await expectRevert(
                                    votingInstance.addVoter(unregisteredUser),
                                    'Voters registration is not open yet'
                                );
                            });
                            it('cannot add proposal yet', async () => {
                                await expectRevert(
                                    votingInstance.addProposal(testProposal, { from: registeredVoter1 }),
                                    'Proposals are not allowed yet'
                                );
                            });

                            it('set vote', async () => {
                                await votingInstance.setVote(1, { from: registeredVoter1 });
                                const voter = await votingInstance.getVoter(registeredVoter1, { from: registeredVoter1 });
                                expect(voter.votedProposalId).to.equal('1');
                                expect(voter.hasVoted).to.equal(true);
                            });
                            it('emit event Voted', async () => {
                                expectEvent(await votingInstance.setVote(1, { from: registeredVoter1 }), 'Voted', { voter: registeredVoter1, proposalId: BN(1) });
                            });
                            it('cannot not vote twice', async () => {
                                await votingInstance.setVote(1, { from: registeredVoter1 })
                                await expectRevert(
                                    votingInstance.setVote(1, { from: registeredVoter1 }),
                                    'You have already voted'
                                );
                            });
                            it('only vote on existing proposal', async () => {
                                await expectRevert(
                                    votingInstance.setVote(42, { from: registeredVoter1 }),
                                    'Proposal not found'
                                );
                            });
                            it('only voter can vote', async () => {
                                await expectRevert(
                                    votingInstance.setVote(1, { from: unregisteredUser }),
                                    'You\'re not a voter'
                                );
                            });

                            describe('With votes', async () => {
                                beforeEach(async () => {
                                    await votingInstance.setVote(1, { from: registeredVoter1 });
                                    await votingInstance.setVote(1, { from: registeredVoter2 });
                                    await votingInstance.setVote(3, { from: registeredVoter3 });
                                });

                                it('end voting session', async () => {
                                    await votingInstance.endVotingSession();
                                    expect(await votingInstance.workflowStatus()).to.be.bignumber.equal(WorkflowStatus.VotingSessionEnded);
                                });
                                it('emit event WorkflowStatusChange on end voting session', async () => {
                                    expectEvent(await votingInstance.endVotingSession(), 'WorkflowStatusChange', { previousStatus: WorkflowStatus.VotingSessionStarted, newStatus: WorkflowStatus.VotingSessionEnded });
                                });
                
                                describe('STATUS: Voting Session Ended', async () =>{
                                    beforeEach(async () => {
                                        await votingInstance.endVotingSession();
                                    });
    
                                    it('cannot register voter after RegisteringVoters status passed', async () => {
                                        await expectRevert(
                                            votingInstance.addVoter(unregisteredUser),
                                            'Voters registration is not open yet'
                                        );
                                    });
                                    it('cannot add proposal yet', async () => {
                                        await expectRevert(
                                            votingInstance.addProposal(testProposal, { from: registeredVoter1 }),
                                            'Proposals are not allowed yet'
                                        );
                                    });
                                    it('only owner can tally votes', async () => {
                                        await expectRevert(
                                            votingInstance.tallyVotes({ from: unregisteredUser }),
                                            'Ownable: caller is not the owner'
                                        );
                                    });
                                    it('tally votes', async () => {
                                        await votingInstance.tallyVotes();
                                        expect(await votingInstance.winningProposalID()).to.be.bignumber.equal(BN(1));
                                    });
                                    it('emit event WorkflowStatusChange on tailly votes', async () => {
                                        expectEvent(await votingInstance.tallyVotes(), 'WorkflowStatusChange', { previousStatus: WorkflowStatus.VotingSessionEnded, newStatus: WorkflowStatus.VotesTallied });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

/*

    getVoter
    -   

    getOneProposal
    -

    addVoter

    addProposal

    setVote

    startProposalsRegistering

    endProposalsRegistering

    startVotingSession

    endVotingSession

    tallyVotes

*/