import React, { useState, useEffect } from 'react'
import "../../css/create.css"
import { BsArrowLeft, BsInfoCircle } from 'react-icons/bs'
import ipfs from '../../utils/Ipfs';
import { useEthersSigner } from '../../utils/ethers';
import { useWalletClient } from 'wagmi'
import { contractAbi, contractAddress } from '../../utils/constants';
import { ethers } from 'ethers';

function CreateProposal() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formTxt, setFormTxt] = useState({
    title: "",
    amount: 0,
    recipent: "",
    description: "",
  })
  const { title, description, amount, recipent } = formTxt;
  const signer = useEthersSigner();
  const { data: walletClient } = useWalletClient()
  const saveToContract = async (desc) => {
    if (walletClient) {
      console.log(title, desc);
      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      const amountInWei = ethers.utils.parseUnits(amount, 'ether');
      const tx = await contract.createProposal(desc, title, amountInWei, recipent);
      // const eventName = 'NewProposal';
      // const filter = {
      //   address: contractAddress,
      //   topics: [ethers.utils.id(eventName)] // Use ethers.utils.id to get the event topic
      // };

      // // Wait for the "NewProposal" event to be emitted
      // contract.once(filter, (event) => {
      //   console.log('NewProposal event received:', event);
      //   // Handle the event data here
      // });

      // console.log(tx);
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (walletClient) {
      if (description.trim() !== '' && title.trim() !== '' && parseInt(amount) !== 0 && recipent.trim() !== '') {
        // Replace \n, \r, and \n\r with <p> tags
        let htmlText = description.replace(/(\n\r?|\r\n?)/g, '</p><p>');
        htmlText = '<p>' + htmlText + '</p>';

        // Remove empty <p></p> tags at the end
        htmlText = htmlText.replace(/<p><\/p>$/, '');

        // Append an <img> tag with the URL inside [text] as alt text
        htmlText = htmlText.replace(/\[(https:\/\/.*?)\]/g, (match, url) => {
          const altText = match.slice(1, -1); // Remove square brackets
          return `<img src="${url}" alt="">`;
        });
        const { cid } = await ipfs.add(htmlText);
        // setContent(htmlText);
        // save to contract
        saveToContract(cid.toString());
      }
    }
  };

  const settxtrecord = (e) => {
    setFormTxt({ ...formTxt, [e.target.name]: e.target.value });
  }

  const uploadImg = async (e) => {
    setLoading(true);
    const file = e.target.files[0];
    const { cid } = await ipfs.add(file);
    setFormTxt({
      ...formTxt,
      description: `${formTxt.description}\n[https://ipfs.io/ipfs/${cid.toString()}]`,
    });
    e.target.value = null;
    setLoading(false);
  }
  const goBack = () => {
    history.back();
  }
  const setRecipent = async () => {
    const accounts = await walletClient.getAddresses();
    setFormTxt({ ...formTxt, ["recipent"]: accounts[0] });
  };
  useEffect(() => {
    if (walletClient) {
      setConnected(true);
      setRecipent();
    }
  }, [walletClient])

  return (
    <div className='create'>
      <form action="" onSubmit={onSubmit}>
        <div className="back" onClick={goBack}>
          <BsArrowLeft /> Back
        </div>
        {
          !connected &&
          <p className="info">
            <BsInfoCircle /> You need to connect your wallet in order to submit a proposal.
          </p>
        }
        <div className="row">
          <label htmlFor="title">Title</label>
          <input type="text" id='title' name='title' value={title} onChange={settxtrecord} />
        </div>
        <div className="row">
          <label htmlFor="amount">Proposal Amount</label>
          <input type="tel" id='amount' name='amount' value={amount} onChange={settxtrecord} />
        </div>
        <div className="row">
          <label htmlFor="description">Description(optional)</label>
          <textarea id='description' name='description' value={description} onChange={settxtrecord} />
          <label htmlFor="file" className='fileLabel'>
            {loading ?
              <div className="loader"></div>
              :
              " Attach Images by dragging and dropping,selecting or pasting them"
            }
          </label>
          <input type="text" id='mainDesc' style={{ display: "none" }} />
          <input type="file" id='file' style={{ display: "none" }} onChange={uploadImg} />
        </div>
        <div className="row">
          <label htmlFor="recipent">Recipent</label>
          <input type="text" id='recipent' name='recipent' value={recipent} onChange={settxtrecord} />
        </div>
        <div className="row">
          <button>Create</button>
        </div>
      </form>
      {/* <div className="sidebar">

      </div> */}
    </div>
  )
}
export default CreateProposal