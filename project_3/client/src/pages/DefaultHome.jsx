import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export function DefaultHome() {

    return (
        <Container fluid className="h-100" style={{ backgroundColor: 'black', padding: '200px'}}>
            <Row className="h-75">
                <Col className="d-flex align-items-center justify-content-center flex-column">
                    <img src="https://media3.giphy.com/media/njYrp176NQsHS/giphy.gif" alt="You Shall Not Pass!" />
                    <p style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: '1.4', color: '#873e23' }}>You can not use this voting Dapp.</p>
                    <p style={{ fontSize: '1.4rem', marginTop: '1', color: '#873e23' }}>You should go now.. time to leave... GOOD BYE!</p>
                </Col>
            </Row>
        </Container>
    );
}