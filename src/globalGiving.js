import axios from 'axios';

let API_TOKEN = '';
let GATEWAY_KEY = '';
const API_KEY = process.env.API_KEY;

// const API_EMAIL = process.env.API_EMAIL;
// const API_PASS = process.env.API_PASS;
// const TEST_GATEWAY_KEY = process.env.TEST_GATEWAY_KEY;

const projectIds = [
  43209,
  43238,
  43349,
  43044,
  34797,
  17766,
  32965,
  40601,
  8758,
  39506
];

export const getProjectIds = async () => {
  const projectUrl = `https://api.globalgiving.org/api/public/projectservice/featured/projects?api_key=${API_KEY}`;
  const res = await axios.get(projectUrl);
  return res.data;
};

export const getAllProjects = () => {
  const projects = projectIds.map((id) => {
    const projectUrl = `https://api.globalgiving.org/api/public/projectservice/projects/${id}?api_key=${API_KEY}`;
    return axios.get(projectUrl).then((res) => res.data.project);
  });
  return Promise.all(projects);
};

export const setToken = (token) => (API_TOKEN = token);

export const setGatewayKey = (key) => (GATEWAY_KEY = key);

export const getGatewayKey = () => GATEWAY_KEY;

export const getToken = async () => {
  const res = await axios.get('http://localhost:5000/api/get_token');
  return res.data;
};

export const makeDonation = async ({
  firstname,
  lastname,
  email,
  amount,
  projectId,
  nonce,
  test = true
}) => {
  let donationUrl = `https://api.globalgiving.org/api/secure/givingservice/donationsclient?api_key=${API_KEY}&api_token=${API_TOKEN}`;
  donationUrl = test ? donationUrl + '&is_test=true' : donationUrl;

  const res = await axios.post(donationUrl, {
    donation: {
      refcode: 'terreform_refcode',
      transactionId: 'terreform_transactionid',
      email,
      amount,
      project: {
        id: projectId
      },
      signupForGGNewsletter: false,
      signupForCharityNewsletter: false,
      payment_detail: {
        firstname,
        lastname,
        paymentGateway: 'braintree',
        paymentGatewayKey: GATEWAY_KEY,
        paymentGatewayNonce: nonce
      }
    }
  });
  return res;
};