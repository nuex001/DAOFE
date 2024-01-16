import axios from "axios";
import Ipfs from "./Ipfs";

const readProposalsIPFSContent = async (hash) => {
    try {
        // Fetch the content from IPFS
        const response = await axios.get(`https://ipfs.io/ipfs/${hash}`);
        const content = response.data;
        // Create a DOM element to parse the content
        const tempElement = document.createElement('div');
        tempElement.innerHTML = content;

        // Find the first <p> element and get its text content
        const firstPElement = tempElement.querySelector('p');

        return `<p>${firstPElement.textContent}</p>`;
    } catch (error) {
        console.error("Error reading IPFS content:", error);
    }

};

const readProposalIPFSContent = async (hash) => {
    try {
        // Fetch the content from IPFS
        const response = await axios.get(`https://ipfs.io/ipfs/${hash}`);
        const content = response.data;
        return content;
    } catch (error) {
        console.error("Error reading IPFS content:", error);
    }

};

const formateDate = (time) => {
    // Unix timestamp
    const timestamp = time * 1000; // JavaScript uses milliseconds, so multiply by 1000

    // Create a Date object
    const date = new Date(timestamp);

    // Extract the date and time components
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-based, so add 1
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Format the date and time
    const formattedDate = `${month.toString().padStart(2, '0')} - ${year} - ${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return formattedDate;
}

export const formatProposals = async (tx) => {
    let proposals = [];
    if (tx) {
        for await (const list of tx) {
            let timeElapse = false;
            let time = Number(list.endTime);
            if (Number(list.endTime) !== 0) {
                const currentTime = new Date().getTime();
                const uintTimestamp = Math.floor(currentTime / 1000);
                timeElapse = uintTimestamp > Number(list.endTime);
                // Convert timestamp to milliseconds
                const milliseconds = list.endTime - uintTimestamp;
                const difference = Number(milliseconds * 1000);
                // Calculate the number of weeks
                const weeks = Math.floor(difference / (1000 * 60 * 60 * 24 * 7));
                // Calculate the remaining time after removing weeks
                const remainingTime = difference % (1000 * 60 * 60 * 24 * 7);
                // Calculate the number of days
                const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
                // Calculate the remaining time after removing days
                const remainingTimeAfterDays = remainingTime % (1000 * 60 * 60 * 24);
                const hours = Math.floor(remainingTimeAfterDays / (1000 * 60 * 60));
                const minutes = Math.floor((remainingTimeAfterDays % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remainingTimeAfterDays % (1000 * 60)) / 1000);

                const timeString = `${weeks > 0 ? weeks + "w, " : ""}${days > 0 ? days + "d, " : ""}${hours > 0 ? hours + "h, " : ""}${minutes > 0 ? minutes + "m, " : ""}${seconds > 0 ? seconds + "s" : ""}`;
                time = timeString.length > 0 ? timeString : "";
            }

            const description = (await readProposalsIPFSContent(list.description)) ?? {};
            const proposal = {
                id: Number(list.id),
                title: list.title,
                proposer: list.proposer,
                details: description,
                timeElapse: timeElapse,
                endTime: time,
                executed: list.executed,
            };
            proposals.push(proposal);
        }
    }
    return proposals;
};


export const formatProposal = async (tx) => {
    let proposal = null;
    // console.log(Number(tx.startTime));
    if (tx) {
        let timeElapse = false;
        let time = Number(tx.endTime);
        if (Number(tx.endTime) !== 0) {
            const currentTime = new Date().getTime();
            const uintTimestamp = Math.floor(currentTime / 1000);
            timeElapse = uintTimestamp > Number(tx.endTime);
            // Convert timestamp to milliseconds
            const milliseconds = tx.endTime - uintTimestamp;
            const difference = Number(milliseconds * 1000);
            // Calculate the number of weeks
            const weeks = Math.floor(difference / (1000 * 60 * 60 * 24 * 7));
            // Calculate the remaining time after removing weeks
            const remainingTime = difference % (1000 * 60 * 60 * 24 * 7);
            // Calculate the number of days
            const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
            // Calculate the remaining time after removing days
            const remainingTimeAfterDays = remainingTime % (1000 * 60 * 60 * 24);
            const hours = Math.floor(remainingTimeAfterDays / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTimeAfterDays % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTimeAfterDays % (1000 * 60)) / 1000);

            const timeString = `${weeks > 0 ? weeks + "w, " : ""}${days > 0 ? days + "d, " : ""}${hours > 0 ? hours + "h, " : ""}${minutes > 0 ? minutes + "m, " : ""}${seconds > 0 ? seconds + "s" : ""}`;
            time = timeString.length > 0 ? timeString : "";
        }
console.log(tx.description);
        const description = (await readProposalIPFSContent(tx.description)) ?? {};
        const startDate = formateDate(tx.startTime)
        const endDate = formateDate(tx.endTime)
        proposal = {
            id: Number(tx.id),
            title: tx.title,
            proposer: tx.proposer,
            recipient: tx.recipient,
            description: description,
            timeElapse: timeElapse,
            executed: tx.executed,
            startDate: startDate,
            endDate: endDate,
            amount: tx.amount,
            noVotes: Number(tx.noVotes),
            yesVotes: Number(tx.yesVotes),
            endTime: time,
        }
    }
    return proposal;
};
