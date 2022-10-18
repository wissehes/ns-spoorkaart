import axios from "axios";

const NS = axios.create({
  baseURL: "https://gateway.apiportal.ns.nl",
  headers: {
    "Ocp-Apim-Subscription-Key": "ebe8f1f1ad584f309cf6eee7f28bf8c9",
  },
});

export default NS;
