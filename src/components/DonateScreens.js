import React from 'react';
import styled from 'styled-components';

import Loading from './presentational/Loading';

const Row = styled.div`
  width: 74%;
  margin-left: 13%;
  display: flex;
  justify-content: ${(props) => (props['flex-end'] ? 'flex-end' : 'center')};
  align-items: center;
`;

const LoadingText = styled.h3`
  margin-top: 40%;
  margin-bottom: 15%;
  text-align: center;
`;

export const Processing = () => {
  return (
    <>
      <LoadingText>Confirming Purchase</LoadingText>
      <Row>
        <Loading />
      </Row>
    </>
  );
};

const SuccessWrapper = styled.div`
  text-align: center;
  margin: 40px;

  h3 {
    font-size: 19px;
  }

  p {
    font-size: 15px;
  }
`;

const Img = styled.img`
  height: 300px;

  &:hover {
    cursor: pointer;
    outline: none;
  }
`;

export const Success = ({ donation, onContinue }) => {
  return (
    <SuccessWrapper>
      <h2>Thank You.</h2>
      <h3>
        You have successfully donated ${donation.amount}! Your receipt number is
        "{donation.receipt.receiptNumber}".
      </h3>
      <Img src="images/pine.png" onClick={onContinue} />
      <p>
        <em>Click the tree above to plant yours.</em>
      </p>
      <p>
        Your contribution will help plant more trees, build more homes, improve
        air quality, and protect our oceans. With every donation, another tree
        is planted.
      </p>
    </SuccessWrapper>
  );
};