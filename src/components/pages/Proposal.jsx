import React, { useEffect, useRef, useState } from 'react'
import "../../css/proposal.css"
import { BsArrowLeft, BsShare } from 'react-icons/bs'
import avatar from "../../assets/nft5.jpg"
import { contractAbi, contractAddress } from '../../utils/constants';
import { ethers } from 'ethers';
import { formatProposal } from '../../utils/utils';
import { useParams } from 'react-router-dom';
function Proposal() {
    const textRef = useRef();
    const [proposal, setProposal] = useState(null);
    const [votes, setVotes] = useState([]);
    const [votesCount, setVotesCount] = useState(0);
    const { id } = useParams();
    const fetchProposal = async () => {
        const provider = new ethers.providers.JsonRpcProvider(import.meta.env.VITE_PUBLIC_RPC_URL);
        const contract = new ethers.Contract(
            contractAddress,
            contractAbi,
            provider
        );
        const maxEvents = 10; // Adjust this as needed
        const proposalId = ethers.BigNumber.from(id);
        contract.queryFilter("VoteEvent")
            .then((events) => {
                // Filter events by ID and limit to 10
                setVotesCount(events.length);
                const filteredEvents = events.filter((event) => Number(event.args.proposalId) === Number(id)).slice(0, maxEvents);

                // Process the filtered events here
                setVotes(filteredEvents);
            })
            .catch((error) => {
                console.error(error);
            });

        const tx = await contract.getProposal(parseInt(id));
        const formattedProposal = await formatProposal(tx);
        setProposal(formattedProposal);
    }
    useEffect(() => {
        if (id) {
            fetchProposal();
        }
    }, [])
    const goBack = () => {
        history.back();
    }
    const showmoreFunc = (e) => {
        if (textRef.current.classList.contains("more")) {
            textRef.current.classList.remove("more");
            e.target.textContent = "Show more"
        } else {
            textRef.current.classList.add("more");
            e.target.textContent = "Show less"
        }
    }
    const execute = () => {
        console.log(id);
    }
    const vote = (e) => {
        const voteVal = e.target.getAttribute("data-voteval");
        console.log(voteVal);
    }

    return (
        <div className='proposal'>
            <main>
                <div className="back" onClick={goBack}>
                    <BsArrowLeft /> Back
                </div>
                <h1>Magic Square Community Validation: Temple Wallet on the Magic Store Voting</h1>
                <div className='headcont'>
                    {
                        proposal &&
                            proposal.timeElapse ?
                            <div className="status closed">
                                {
                                    proposal.executed ?
                                        "closed"
                                        :
                                        "ended"
                                }
                            </div>
                            :
                            <div className="status">Active</div>
                    }

                    <img src={avatar} alt="" />
                    <span>{proposal &&
                        proposal.proposer
                    }</span>

                    <div className='shareBtn'>
                        <BsShare />
                        share
                    </div>
                </div>
                <div className="child">
                    <div className="text" ref={textRef}>
                        <div dangerouslySetInnerHTML={{
                            __html: proposal &&
                                proposal.description
                        }} />
                        <div className="moreCont">
                            <div className="btn" onClick={showmoreFunc}>
                                Show more
                            </div>
                        </div>
                    </div>
                    <ul className="vote_cont">
                        <h1>Cast your vote</h1>
                        {
                            proposal &&
                                proposal.timeElapse ?
                                !proposal.executed &&
                                <button onClick={execute}>Execute</button>
                                :
                                <>
                                    <div className="btn" data-voteval="yes" onClick={vote}>Yes</div>
                                    <div className="btn" data-voteval="no" onClick={vote}>No</div>
                                    <button>Vote</button>
                                </>
                        }
                    </ul>
                    <ul className="votes">
                        <h1>Votes <span>{votesCount}</span></h1>
                        {votes.map(list => (
                            <li>
                                <div className="pf">
                                    <img src={avatar} alt="" />
                                    <p>0x8457...B8E5</p>
                                </div>
                                <h4>Yes</h4>
                                <h4>1 Buildl</h4>
                            </li>
                        ))}
                        {/* <li>
                            <div className="pf">
                                <img src={avatar} alt="" />
                                <p>0x8457...B8E5</p>
                            </div>
                            <h4>Yes</h4>
                            <h4>1 Buildl</h4>
                        </li> */}
                        <li>
                            See more
                        </li>
                    </ul>
                </div>
            </main>
            <div className="sidebar">
                <div className="info">
                    <h1>Information</h1>
                    <ul className="txt">
                        <li><span>Voting system</span> single choice voting</li>
                        <li><span>Start date</span> {proposal && proposal.startDate}</li>
                        <li><span>End date</span> {proposal && proposal.startDate}</li>
                    </ul>
                </div>
                <div className="info">
                    <h1>Current results</h1>
                    <ul className="txt">
                        <h4><span>Yes</span> <span>85.92%</span></h4>
                        <div className="progress_cont">
                            <div className="progress_bar" style={{ width: "85.92%" }}></div>
                        </div>
                        <h4><span>No</span> <span>14.08%</span></h4>
                        <div className="progress_cont">
                            <div className="progress_bar" style={{ width: "14.08%" }}></div>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Proposal