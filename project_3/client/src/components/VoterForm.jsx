import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useRef } from 'react';
import { useEth } from '../contexts/EthContext';

export function VoterForm() {
    const { state: { contract, accounts, currentStatus, isOwner, voters } } = useEth();
    const inputRef = useRef(null);

    const registerVoter = (e) => {
        e.preventDefault();
        const address = inputRef.current.value;

        if (!isOwner) {
            alert('You are not the owner.');
            return;
        }

        if (currentStatus.index !== 0) {
            alert('You cannot register voter now.');
            return;
        }

        if (!/^0x[0-9a-z]{40}$/i.test(address) || /^0x0{40}$/.test(address)) {
            alert('Invalid Public Address!');
            return;
        }

        if (voters.find(voter => voter.address === accounts[0])) {
            alert('Already Registered');
            return;
        }

        contract.methods.addVoter(address).send({ from: accounts[0] }).then(() => {
            inputRef.current.value = '';
            inputRef.current.focus();
        });
        
    };

    return (
        <Form style={{ width: '500px', padding: '20px', margin: '50px 0', border: '1px solid grey' }}>
            <Row className="mb-3">
                <Form.Group as={Col} controlId="voterAddress">
                    <Form.Label>Add Voter Address</Form.Label>
                    <Form.Control
                        ref={inputRef}
                        type="text"
                        placeholder="0x00000000000000000000000000000000"
                    />
                    <Form.Text muted>
                        The address must be a valid public address.
                    </Form.Text>
                </Form.Group>
            </Row>
            <Row className="mb-3">
                <Button  onClick={registerVoter} variant="primary" type="submit">
                    Register voter
                </Button>
            </Row>
        </Form>
    );
}