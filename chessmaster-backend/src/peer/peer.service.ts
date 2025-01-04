import { Injectable, OnModuleInit } from '@nestjs/common';
import { ExpressPeerServer } from 'peer';
import * as express from 'express';
import * as https from 'https';
import * as fs from 'fs';

@Injectable()
export default class PeerService implements OnModuleInit {
  private readonly app = express();
  httpsOptions = {
    key: fs.readFileSync('certs/key.pem'),
    cert: fs.readFileSync('certs/cert.pem'),
  };
  private readonly server = https.createServer(this.httpsOptions, this.app).listen(4001, () => {
    console.log('PeerJS server is running on port 4001 with HTTPS');
  });

  private readonly peerServer = ExpressPeerServer(this.server, {
    allow_discovery: true,
  });

  onModuleInit() {
    this.app.use('/peer', this.peerServer);
  }
}