import React, { useState, useEffect } from 'react'
import "../../css/create.css"
import { BsArrowLeft, BsInfoCircle } from 'react-icons/bs'
import { BiError } from 'react-icons/bi'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import ipfs from '../../utils/Ipfs';
import { useEthersSigner } from '../../utils/ethers';
import { useWalletClient } from 'wagmi'
import { contractAbi, contractAddress } from '../../utils/constants';
import { ethers } from 'ethers';

function CreateProposal() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formTxt, setFormTxt] = useState({
    title: "",
    amount: 0,
    recipent: "",
    description: "",
  })
  const { title, description, amount, recipent } = formTxt;
  const signer = useEthersSigner();
  const { data: walletClient } = useWalletClient();
  const [error, setError] = useState(false);
  const [success, setsuccess] = useState(false);

  const saveToContract = async (desc) => {
    try {
      if (walletClient) {
        console.log(title, desc);
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );
        const amountInWei = ethers.utils.parseUnits(amount, 'ether');
        const tx = await contract.createProposal(desc, title, amountInWei, recipent);
        setFormTxt({
          title: "",
          amount: 0,
          recipent: "",
          description: "",
        })
        setsuccess(true);
        setTimeout(() => {
        setsuccess(false);
        }, 5000);
      }
    } catch (error) {
      // console.log(error);
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (walletClient) {
      if (description.trim() !== '' && title.trim() !== '' && parseInt(amount) !== 0 && recipent.trim() !== '') {
        setError(false);
        setSubmitLoading(true);
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
      await  saveToContract(cid.toString());
      setSubmitLoading(false);
      }else{
        setError(true)
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
          connected && !error && !submitLoading && !success &&
          <p className="info">
            <BsInfoCircle /> To create proposals, you should possess at least 100 Buidl tokens.
          </p>
        }
        {
          !connected &&
          <p className="info">
            <BsInfoCircle /> You need to connect your wallet in order to submit a proposal.
          </p>
        }
        {
          error &&
          <p className="info" style={{color:"crimson"}}>
            <BiError /> Please Fill all Inputs.
          </p>
        }
        {
          submitLoading &&
          <p className="info">
            <AiOutlineLoading3Quarters className='loadingIcon'/> Loading...
          </p>
        }
        {
          success &&
          <p className="info" style={{color:"green"}}>
            Proposal created.
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