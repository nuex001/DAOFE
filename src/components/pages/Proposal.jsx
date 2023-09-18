import React, { useEffect, useRef, useState } from 'react'
import "../../css/proposal.css"
import { BsArrowLeft, BsShare } from 'react-icons/bs'
import avatar from "../../assets/nft5.jpg"
import { contractAbi, contractAddress } from '../../utils/constants';
import { ethers } from 'ethers';
import { formatProposal } from '../../utils/utils';
import { useParams } from 'react-router-dom';
import { useEthersSigner } from '../../utils/ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function Proposal() {
    const textRef = useRef();
    const [proposal, setProposal] = useState(null);
    const [votes, setVotes] = useState([]);
    const [votesCount, setVotesCount] = useState(0);
    const [percentage, setPercentage] = useState({
        yes: "",
        no: "",
    });
    const [loading, setLoading] = useState(false);
    const { id } = useParams();

    const getPercentageSum = (yescount, nocount) => {
        // Values
        // const yescount = 999;
        // const nocount = 200;

        // Calculate the sum of the two values
        const sum = yescount + nocount;

        // Calculate the percentage of each value with respect to the sum
        const yesPercentage = yescount > 0 ? (yescount / sum) * 100 : 0;
        const noPercentage = nocount > 0 ? (nocount / sum) * 100 : 0;
        // console.log(`Percentage of ${yescount} relative to the sum: ${yesPercentage.toFixed(2)}%`);
        // console.log(`Percentage of ${nocount} relative to the sum: ${noPercentage.toFixed(2)}%`);
        setPercentage({
            yes: yesPercentage,
            no: noPercentage,
        })
        // return { yesPercentage, noPercentage }
    }

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
                // Initialize votesCount somewhere before this code.
                let count = 0;
                let yescount = 0;
                let nocount = 0;

                // Filter events by ID and limit to 10, incrementing count in the process
                const filteredEvents = events
                    .filter((event) => {
                        if (Number(event.args.proposalId) === Number(id)) {
                            // Increment count for each matching event
                            count++;
                            if (event.args.support) {
                                yescount += Number((event.args.voterWeight) / 1e18);
                            } else {
                                nocount += Number((event.args.voterWeight) / 1e18);
                            }
                            return true; // Include this event in the filtered result
                        }
                        return false; // Exclude this event from the filtered result
                    })
                    .slice(0, 10);

                // Now, votesCount will contain the total count of matching events.

                setVotesCount(count);
                setVotes(filteredEvents);
                getPercentageSum(yescount, nocount)
            })
            .catch((error) => {
                console.error(error);
            });

        const tx = await contract.getProposal(parseInt(id));
        const formattedProposal = await formatProposal(tx);
        setProposal(formattedProposal);
    }

    function truncateAddress(address, length = 10) {
        if (address.length <= length) {
            return address; // No need to truncate
        }

        const prefix = address.slice(0, 2); // Get the "0x" prefix
        const truncatedPart = '...'; // You can replace this with any string you want
        const suffix = address.slice(-length);

        return `${prefix}${truncatedPart}${suffix}`;
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
    const signer = useEthersSigner();
    const execute = async () => {
        try {
            if (signer) {
                const contract = new ethers.Contract(
                    contractAddress,
                    contractAbi,
                    signer
                );
                setLoading(true);
                const tx = await contract.executeProposal(parseInt(id));
                setLoading(false);
                toast.success('Proposal Executed successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }
        } catch (error) {
            // console.log();
            if (error.message.includes("ERC20: transfer amount exceeds balance")) {
                toast.error('⚠️ERC20: transfer amount exceeds contract balance!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                fetchProposal()
            }
        }

    }
    const vote = async (e) => {
        try {
            const voteVal = e.target.getAttribute("data-voteval");
            console.log(voteVal);
            const contract = new ethers.Contract(
                contractAddress,
                contractAbi,
                signer
            );
            setLoading(true);
            const tx = await contract.Vote(parseInt(id), voteVal);
            setLoading(false);
            toast.success('Voted Successfully ✓', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } catch (error) {
            setLoading(false);
            console.log(error);
            if (error.message.includes("execution reverted: Voter already added")) {
                toast.error('execution reverted: Voter already added!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }
        }
    }

    return (
        <div className='proposal'>
            <main>
                <ToastContainer />
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
                    {
                        proposal &&
                            proposal.executed ?
                            <></>
                            :
                            <ul className="vote_cont">
                                <h1>Cast your vote</h1>
                                {
                                    proposal?.timeElapse ?
                                        <button onClick={execute}>Execute</button>
                                        :
                                        <>
                                            <div className="btn" data-voteval="yes" onClick={vote}>Yes</div>
                                            <div className="btn" data-voteval="no" onClick={vote}>No</div>
                                        </>
                                }
                            </ul>
                    }

                    <ul className="votes">
                        <h1>Votes <span>{votesCount}</span></h1>
                        {votes.map((list, idx) => (
                            <li key={idx}>
                                <div className="pf">
                                    <img src={avatar} alt="" />
                                    <p>{truncateAddress(list.args.voter)}</p>
                                </div>
                                <h4>Yes</h4>
                                <h4>{Math.ceil(Number(list.args.voterWeight) / 1e18)} Buildl</h4>
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
                        <h4><span>Yes</span> <span>{percentage.yes}%</span></h4>
                        <div className="progress_cont">
                            <div className="progress_bar" style={{ width: `${percentage.yes}%` }}></div>
                        </div>
                        <h4><span>No</span> <span>{percentage.no}%</span></h4>
                        <div className="progress_cont">
                            <div className="progress_bar" style={{ width: `${percentage.no}%` }}></div>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Proposal