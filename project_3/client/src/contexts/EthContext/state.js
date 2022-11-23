const actions = {
  init: "INIT",
  update: "UPDATE",
  initVoters: "INIT_VOTERS",
  addVoter: "ADD_VOTER",
  initProposals: "INIT_PROPOSALS",
  addProposal: "ADD_PROPOSAL",
  initVotes: "INIT_VOTES",
  addVote: "ADD_VOTE",
  hasVoted: "HAS_VOTED",
  updateWinner: "UPDATE_WINNER",
  reset: "RESET"
};

const initialState = {
  artifact: null,
  web3: null,
  accounts: null,
  networkID: null,
  contract: null,

  isConnected: false,
  isOwner: false,
  isVoter: false,
  isUnregistered: false,
  hasVoted: false,

  currentStatus: null,
  voters: [],
  proposals: [],
  votes: [],

  winningProposalID: 0,
};

const reducer = (state, action) => {
  const { type, data } = action;
  switch (type) {
    case actions.init:
      return { ...state, ...data };
    case actions.update:
      return { ...state, ...data };
    case actions.initVoters:
      return { ...state, voters: data };
    case actions.addVoter:
      return { ...state, voters: [...state.voters, data] };
    case actions.initProposals:
      return { ...state, proposals: data };
    case actions.addProposal:
      return { ...state, proposals: [...state.proposals, data] };
    case actions.initVotes:
      return { ...state, votes: data };
    case actions.addVote:
      return { ...state, votes: [...state.votes, data.vote] };
    case actions.hasVoted:
      return { ...state, hasVoted: true };
    case actions.updateWinner:
      return { ...state, ...data };
    case actions.reset:
      return { ...state, voters: [] };
    default:
      throw new Error("Undefined reducer action type");
  }
};

export {
  actions,
  initialState,
  reducer
};
