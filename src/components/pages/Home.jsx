import React, { useEffect, useState } from 'react'
import "../../css/home.css"
import { BsFillPatchCheckFill } from 'react-icons/bs'
import { ImSearch } from 'react-icons/im'
import { Link } from 'react-router-dom'
import avatar from "../../assets/nft5.jpg"
import { contractAbi, contractAddress } from '../../utils/constants'
import { ethers } from 'ethers'
import { formatProposals } from '../../utils/utils'
function Home() {
    const [proposals, setProposals] = useState([]);
    const fetchProposals = async () => {
        const provider = new ethers.providers.JsonRpcProvider(import.meta.env.VITE_PUBLIC_RPC_URL);
        const contract = new ethers.Contract(
            contractAddress,
            contractAbi,
            provider
        );
        const tx = await contract.getAllProposals();
        const formattedProposals = await formatProposals(tx);
        setProposals(formattedProposals);
        // setProposals(tx);
    }
    useEffect(() => {
        fetchProposals();
    }, [])
    return (
        <div className='home'>
            <div className="sidebar">
                <img src="logo1.png" alt="" />
                <h1>Buildl <BsFillPatchCheckFill /></h1>
                <h2>2k Proposals</h2>
            </div>
            <main>
                <h1>Proposals</h1>
                <div className="header">
                    <form action="">
                        <label htmlFor="search"><ImSearch className="icon" /></label>
                        <input type="text" placeholder='search' id='search' />
                    </form>
                    <Link to={"/create"}>New proposal</Link>
                </div>

                <div className="rows">
                    {proposals &&
                        proposals.map((proposal, idx) => (
                            <Link to={`/${proposal.id}`} className="box" key={idx}>
                                <div className="box-header">
                                    <div className="sec1">
                                        <img src={avatar} alt="avatar" />
                                        <p>{proposal.proposer}</p>
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
                                <h4>{proposal.description}</h4>
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