import React, { useEffect, useRef, useState } from 'react'
import "../../css/home.css"
import { BsFillPatchCheckFill } from 'react-icons/bs'
import { ImSearch } from 'react-icons/im'
import { Link } from 'react-router-dom'
import avatar from "../../assets/nft5.jpg"
import { contractAbi, contractAddress } from '../../utils/constants'
import { ethers } from 'ethers'
import { formatProposals } from '../../utils/utils'
import { useWalletClient } from 'wagmi'
import { useEthersSigner } from '../../utils/ethers'
function Home() {
    const [initialData, setInitialData] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [proposalsCount, setProposalsCount] = useState(0);
    const signer = useEthersSigner();
    const { data: walletClient } = useWalletClient();
    const fetchProposals = async () => {
        const provider = new ethers.providers.JsonRpcProvider(import.meta.env.VITE_PUBLIC_RPC_URL);
        const contract = new ethers.Contract(
            contractAddress,
            contractAbi,
            provider
        );
        const tx = await contract.getAllProposals();
        const formattedProposals = await formatProposals(tx);
        console.log(formattedProposals);
        setProposals(formattedProposals);
        setInitialData(formattedProposals);
        setProposalsCount(formattedProposals.length);
        // setProposals(tx);
    }
    function truncateAddress(address, length = 10) {
        if (address.length <= length) {
            return address; // No need to truncate
        }

        const prefix = address.slice(0, 4); // Get the "0x" prefix
        const truncatedPart = '....'; // You can replace this with any string you want
        const suffix = address.slice(-length);

        return `${prefix}${truncatedPart}${suffix}`;
    }
    const onSubmit = (e) => {
        e.preventDefault();
        const val = e.target.search.value.trim().toLowerCase();
        if (val !== "") {
            const updatedData = initialData.filter((item) => item.title.toLowerCase().includes(val));
            setProposals(updatedData);
        } else {
            setProposals(initialData);
        }
    }
    const RequestToken = async (e) => {
        e.preventDefault();
        if (walletClient) {
            const contract = new ethers.Contract(
                contractAddress,
                contractAbi,
                signer
            );
            await contract.RequestVoterToken();
        }
    }
    useEffect(() => {
        fetchProposals();
    }, [])
    return (
        <div className='home'>
            <div className="sidebar">
                <img src="logo1.svg" alt="" />
                <h1>DigiGovt <BsFillPatchCheckFill /></h1>
                <h2>{proposalsCount} Proposals</h2>
            </div>
            <main>
                <h1>Proposals</h1>
                <div className="header">
                    <form action="" onSubmit={onSubmit}>
                        <label htmlFor="search"><ImSearch className="icon" /></label>
                        <input type="text" placeholder='search' id='search' name='search' />
                    </form>
                    <div className="links">
                        <Link to={"/create"}>New proposal</Link>
                        <Link onClick={RequestToken}>Request Token</Link>
                    </div>
                </div>

                <div className="rows">
                    {proposals &&
                        proposals.map((proposal, idx) => (
                            <Link to={`/${proposal.id}`} className="box" key={idx}
                            // ref={(el) => (listRef.current[idx] = el)}
                            >
                                <div className="box-header">
                                    <div className="sec1">
                                        <img src={avatar} alt="avatar" />
                                        <p>{truncateAddress(proposal.proposer)}</p>
                                    </div>
                                    {
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
                                </div>
                                <h3>{proposal.title}</h3>
                                <h4 dangerouslySetInnerHTML={{
                                    __html: proposal.details
                                }}></h4>
                                {
                                    !proposal.timeElapse &&
                                    <span>Ends in {proposal.endTime}</span>
                                }
                            </Link>
                        ))
                    }
                </div>
            </main>
        </div>
    )
}

export default Home