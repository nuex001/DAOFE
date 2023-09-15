import React, { useRef } from 'react'
import { GiWorld } from "react-icons/gi"
import { ConnectButton } from '@rainbow-me/rainbowkit';

function Nav() {
    const contRef = useRef();
    function handleLangSelect(event) {
        event.preventDefault();
        const selectedLang = event.currentTarget.getAttribute('data-lang');
        const selectElement = document.querySelector('.goog-te-combo');
        selectElement.value = selectedLang;

        selectElement.dispatchEvent(new Event('change'));
        contRef.current.classList.remove("active")
    }
    const toggleCont = () => {
        contRef.current.classList.toggle("active")
    }
    return (
        <nav>
            <a href="/">Invigoratedao</a>
            <ul>
                <li>
                    <ConnectButton.Custom>
                        {({
                            account,
                            chain,
                            openConnectModal,
                            authenticationStatus,
                            openAccountModal,
                            mounted,
                        }) => {
                            // Note: If your app doesn't use authentication, you
                            // can remove all 'authenticationStatus' checks
                            const ready = mounted && authenticationStatus !== 'loading';
                            const connected =
                                ready &&
                                account &&
                                chain &&
                                (!authenticationStatus ||
                                    authenticationStatus === 'authenticated');

                            return (
                                <div
                                    {...(!ready && {
                                        'aria-hidden': true,
                                        'style': {
                                            opacity: 0,
                                            pointerEvents: 'none',
                                            userSelect: 'none',
                                            cursor: 'pointer',
                                        },
                                    })}
                                >
                                    {(() => {
                                        if (!connected) {
                                            return <button onClick={openConnectModal}>Connect wallet</button>
                                        } else {
                                            return <button onClick={openAccountModal}>
                                                Disconnect
                                            </button>
                                        }
                                    }
                                    )()}
                                </div>
                            );
                        }}
                    </ConnectButton.Custom>
                </li>
                <li>
                    <div id="google_translate_element" style={{ opacity: "0", position: "absolute", zIndex: "-1" }} />
                    <GiWorld className='icon' onClick={toggleCont} />
                    <ul className="cont" ref={contRef}>
                        <li data-lang="en" onClick={handleLangSelect}>English</li>
                        <li data-lang="es" onClick={handleLangSelect}>Spanish</li>
                        <li data-lang="zh-CN" onClick={handleLangSelect}>Chinese</li>
                        <li data-lang="hi" onClick={handleLangSelect}>Hindi</li>
                        <li data-lang="ur" onClick={handleLangSelect}>Urdu</li>
                        <li data-lang="fr" onClick={handleLangSelect}>French</li>
                    </ul>
                </li>
            </ul>
        </nav>
    )
}

export default Nav