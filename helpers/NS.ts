import axios from "axios";

const NS = axios.create({
  baseURL: "https://gateway.apiportal.ns.nl",
  headers: {
    "Ocp-Apim-Subscription-Key": process.env.NS_API,
  },
});

export default NS;
