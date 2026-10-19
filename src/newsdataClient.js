// src/newsdataClient.js

import { NewsDataApiClient } from "newsdata-nodejs-client";

const client = new NewsDataApiClient(process.env.NEWSDATA_API_KEY);

export default client;
