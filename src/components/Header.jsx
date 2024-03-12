import { Link } from "react-router-dom";
import Eth from "../eth.svg";
import Logo from "../moralis-logo.svg";
import { ConnectButton } from "web3uikit";
function Header() {
  return (
    <header>
      <div className="flex items-center gap-5">
        <img src={Logo} alt="Logo" className="w-10 h-10" />
        <Link to={"swap"}>
          <div className="cursor-pointer hover:bg-gray-800 p-2">Swap</div>
        </Link>
        <div className="hover:bg-gray-800 p-2 cursor-pointer">Tokens</div>
      </div>
      <div className="">
        <div className="flex items-center gap-2">
          <img src={Eth} alt="eth" className="h-10 w-10" />
          Ethereum
        </div>
      </div>
        <div
          className="bg-gray-500 py-3 border rounded-md hover:transition-all cursor-pointer duration-150 ease-out hover:bg-gray-800 border-gray-500 px-5"
         
        
        >
         <ConnectButton moralisAuth={false}/>
        </div>
    </header>
  );
}
export default Header;
