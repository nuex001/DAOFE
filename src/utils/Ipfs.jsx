import { Buffer } from 'buffer';
import { create } from 'ipfs-http-client';


const projectId =  import.meta.env.VITE_IPFS_ID;   // <---------- your Infura Project ID

const projectSecret =  import.meta.env.VITE_IPFS_SECRET;  // <---------- your Infura Secret

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const ipfs = create({
    host: 'infura-ipfs.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});



export default ipfs;
