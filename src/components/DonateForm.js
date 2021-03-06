import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { makeDonation } from '../globalGiving';
import { initBraintree } from '../braintree';
import { postDonation } from '../biome';

import Input, { FullInput, BraintreeForm } from './presentational/Input';
import Loading from './presentational/Loading';

/* custom field hook */
const useField = (type, init = '') => {
  const [value, setValue] = useState(init);

  const onChange = (e) => setValue(e.target.value);

  return [{ type, value, onChange }, setValue];
};

const Row = styled.div`
  width: 74%;
  margin-left: 13%;
  display: flex;
  justify-content: ${(props) => (props['flex-end'] ? 'flex-end' : 'center')};
  align-items: center;
`;

const Error = styled.div`
  color: #e91e63;
  width: 100%;
  margin-left: -10px;
  font-size: 17px;
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: all 0.2s;
`;

const Divider = styled.div`
  text-align: left;
  font-weight: bold;
  font-size: 22px;
  margin: 15px 14.5%;
  width: 74%;
`;

const Option = styled.div`
  height: 100px;
  width: 50%;
  margin: 10px 0;
  margin-left: 10px;
  text-align: center;
  line-height: 100px;
  border-radius: 10px;
  background-color: ${(props) => (props.selected ? '#222' : '#eee')};
  color: ${(props) => (props.selected ? '#fff' : '#222')};
  font-size: 35px;
  font-weight: bold;
  transition: background-color 0.2s;

  input {
    font-family: 'SF Pro', sans-serif;
    font-size: 30px;
    padding: 5px;
    position: relative;
    background-color: #fff;
    border: none;
    width: 50px;
    height: 35px;
    border-radius: 10px;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input:focus {
    outline: none;
  }

  &:hover {
    background-color: ${(props) => (props.selected ? '#222' : '#c4c4c4')};
    cursor: pointer;
  }
`;

const DonateForm = ({
  projectId,
  biomeId,
  amountArr,
  setStatus,
  addDonation,
  callbacks,
  onClose
}) => {
  const [amount, setAmount] = useField('number');
  const [firstname, setFirst] = useField('text');
  const [lastname, setLast] = useField('text');
  const [message, setMessage] = useField('text');
  const [customAmount, setCustomAmount] = useState('');
  const [email, setEmail] = useState('');
  const [nonce, setNonce] = useState('');

  const [loadingForm, setLoadingForm] = useState(true);
  const [error, setError] = useState('');

  amountArr = amountArr.length ? amountArr : [[{ amount: 10 }, { amount: 30 }]];

  const checkInvalid = () => {
    const validInputs = document.getElementsByClassName(
      'braintree-hosted-fields-valid'
    );
    if (validInputs.length !== 4) {
      return 'Invalid payment information.';
    } else if (!firstname.value || !lastname.value) {
      return 'Missing name.';
    } else if (!email) {
      return 'Missing email.';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return 'Invalid email.';
    } else if (!amount.value) {
      return 'No amount selected.';
    } else if (amount.value < 10) {
      return 'Minimum $10 donation.';
    }
    return '';
  };

  const donate = async (nonce) => {
    setStatus({ status: 'processing' });
    try {
      const res = await makeDonation({
        firstname: firstname.value,
        lastname: lastname.value,
        email,
        amount: parseInt(amount.value),
        projectId: parseInt(projectId),
        nonce: nonce
      });
      const donation = await postDonation(biomeId, {
        username: `${firstname.value} ${lastname.value}`,
        message: message.value
      });
      const model = callbacks.addObject(donation.id);
      addDonation(projectId, { ...donation, type: model.name });
      setStatus({
        status: 'success',
        donation: res.data.donation,
        type: model.name
      });
    } catch (err) {
      console.error(err);
      onClose();
      setTimeout(
        () =>
          alert(
            'There was a problem with your transaction! If the problem persists, please contact us.'
          ),
        250
      );
    }
    setAmount('');
    setFirst('');
    setLast('');
    setEmail('');
    setNonce('');
  };

  useEffect(() => {
    if (nonce) {
      donate(nonce);
    }
  }, [nonce]);

  useEffect(() => {
    let cleanup;
    const wrapped = async () => {
      const res = await initBraintree(
        (hostedFieldsInstance) => (event) => {
          event.preventDefault();
          hostedFieldsInstance.tokenize((err, payload) => {
            if (err) console.error(err);
            console.log('Nonce:', payload.nonce);
            if (!nonce) {
              setNonce(payload.nonce);
            }
          });
        },
        () => {
          if (loadingForm) {
            setLoadingForm(false);
          }
        }
      );
      cleanup = res;
    };
    wrapped();
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return (
    <div>
      {amountArr.map((options, i) => (
        <Row key={options[0].amount}>
          {options.map((option) => (
            <Option
              key={option.amount}
              onClick={() => {
                setAmount(option.amount);
              }}
              selected={
                amount.value === option.amount && amount.value !== customAmount
              }
            >
              ${option.amount}
            </Option>
          ))}
          {i === amountArr.length - 1 ? (
            <Option
              onClick={() => {
                setAmount(customAmount);
              }}
              selected={customAmount && amount.value === customAmount}
            >
              $
              <input
                type="number"
                min={10}
                value={customAmount}
                onChange={(e) => {
                  if (e.target.value >= 0) {
                    const newVal = parseInt(e.target.value);
                    setCustomAmount(newVal);
                    setAmount(newVal);
                  }
                }}
              />
            </Option>
          ) : (
            ''
          )}
        </Row>
      ))}
      <Divider>Your Information</Divider>
      <Row>
        <Input>
          <input {...firstname} />
          <label>First Name</label>
        </Input>
        <Input>
          <input {...lastname} />
          <label>Last Name</label>
        </Input>
      </Row>
      <Row>
        <FullInput>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
          />
          <label>Email</label>
        </FullInput>
      </Row>
      <Row>
        <FullInput>
          <textarea {...message} />
          <label>Message (optional)</label>
        </FullInput>
      </Row>
      <Divider>Payment Information</Divider>
      <BraintreeForm className="demo-frame" loading={loadingForm ? 1 : 0}>
        <Row className="loading">
          <Loading />
        </Row>
        <form action="/" method="post" id="cardForm">
          <div id="card-number" className="hosted-field" />
          <label className="hosted-fields--label" htmlFor="card-number">
            Card Number
          </label>

          <div id="expiration-date" className="hosted-field" />
          <label className="hosted-fields--label" htmlFor="expiration-date">
            Expiration Date
          </label>

          <div id="cvv" className="hosted-field" />
          <label className="hosted-fields--label" htmlFor="cvv">
            CVV
          </label>

          <div id="postal-code" className="hosted-field" />
          <label className="hosted-fields--label" htmlFor="postal-code">
            Postal Code
          </label>

          <Row>
            <Error show={error}>{error}</Error>
            <div className="button-container">
              <input
                type="submit"
                className="button button--small button--green"
                value="Continue"
                id="submit"
                onClick={(e) => {
                  const err = checkInvalid();
                  if (err) {
                    e.preventDefault();
                    setError('');
                    setTimeout(() => {
                      setError(err);
                    }, 200);
                    return;
                  }
                }}
              />
            </div>
          </Row>
        </form>
      </BraintreeForm>
    </div>
  );
};

export default DonateForm;
