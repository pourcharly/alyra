

export const addEventListener = function(contract, eventName, dataHandler) {
    if (!contract) {
        return;
    }
    const onError = err => console.log(`${eventName} error`, err);
    const onChanged = changed => console.log(`${eventName} changed`, changed);
    const onConnected = str => console.log(`${eventName} connected`, str);
    const onData = event => dataHandler(event.returnValues, event);
    const eventEmitter = contract.events[eventName]({ fromBlock: 'earliest' });

    eventEmitter
        .on('data', onData)
        .on('changed', onChanged)
        .on('error', onError)
        .on('connected', onConnected);
    
    return () => {
        console.log('Remove event listeners');
        eventEmitter
            .off('data', onData)
            .off('changed', onChanged)
            .off('error', onError)
            .off('connected', onConnected);
    }
};

export const getOldEventsValues = async function(contract, eventName, resetTimestamp) {
    const events = (await getOldEvents(contract, eventName))
        .map(event => event.returnValues);

    return !resetTimestamp ? events : events.filter(values => parseInt(values.timestamp) > resetTimestamp);
};

export const getOldEvents = async function(contract, eventName) {
    if (!contract) {
        return [];
    }
    let oldEvents = await contract.getPastEvents(eventName, {
        fromBlock: 0,
        toBlock: 'latest'
    });

    return oldEvents;
};