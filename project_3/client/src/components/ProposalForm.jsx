import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useRef } from 'react';
import { useEth } from '../contexts/EthContext';

export function ProposalForm() {
    const { state: { contract, accounts, currentStatus, isVoter } } = useEth();
    const inputRef = useRef(null);

    const registerProposal = (e) => {
        e.preventDefault();
        const description = inputRef.current.value.trim();
        inputRef.current.value = '';
        inputRef.current.focus();

        if (!isVoter) {
            alert('You are not a voter.');
            return;
        }

        if (currentStatus.index !== 1) {
            alert('You cannot register a proposal now.');
            return;
        }

        if (!description) {
            alert('Error: Empty proposal description!');
            return;
        }


        contract.methods.addProposal(description).send({ from: accounts[0] });
    };

    return (
        <Form style={{ width: '500px', padding: '20px', margin: '50px 0', border: '1px solid grey' }}>
            <Row className="mb-3">
                <Form.Group as={Col} controlId="voterAddress">
                    <Form.Label>Add a new proposal</Form.Label>
                    <Form.Control
                        ref={inputRef}
                        type="text"
                        placeholder="Description..."
                    />
                </Form.Group>
            </Row>
            <Row className="mb-3">
                <Button  onClick={registerProposal} variant="primary" type="submit">
                    Register proposal
                </Button>
            </Row>
        </Form>
    );
}