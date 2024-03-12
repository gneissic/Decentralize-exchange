import { Input, Modal, Popover, Radio, message } from "antd";
import {
  SettingOutlined,
  DownOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

import tokenList from "../tokenList.json";
import axios from "axios";
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  useAccount,
  
} from "wagmi";

function Swap() {
  const [messageApi, contextHolder] = message.useMessage();
  const { address, isConnected } = useAccount();
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeTokens] = useState(1);
  const [prices, setPrices] = useState(null);
  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null,
  });

  const { data, sendTransaction } = useSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value),
    },
  });
  const {isLoading, isSuccess}  =  useWaitForTransactionReceipt({
    hash:data?.hash
  })
  const handleSlippageChange = (e) => {
    setSlippage(e.target.value);
    console.log(slippage);
  };
  const changeAmount = (e) => {
    setTokenOneAmount(e.target.value);
    if (e.target.value && prices) {
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(2));
    } else {
      setTokenTwoAmount(null);
    }
  };
  const switchTokens = () => {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  };
  function openModal(asset) {
    setChangeTokens(asset);
    setIsOpen(true);
  }
  function modifyToken(i) {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address);
    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address);
    }
    setIsOpen(false);
  }

  async function fetchPrices(one, two) {
    try {
      const res = await axios.get(`http://localhost:3001/tokenPrice`, {
        params: { addressOne: one, addressTwo: two },
      });
      setPrices(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error.message);
    }
  }
  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address);
  }, []);
  useEffect(() => {
    if (txDetails.to && isConnected) {
      sendTransaction()
    }
  
    
  }, [txDetails, isConnected, sendTransaction])
  useEffect(()=>{

    messageApi.destroy();

    if(isLoading){
      messageApi.open({
        type: 'loading',
        content: 'Transaction is Pending...',
        duration: 0,
      })
    }    

  },[isLoading, messageApi])

  useEffect(()=>{
    messageApi.destroy();
    if(isSuccess){
      messageApi.open({
        type: 'success',
        content: 'Transaction Successful',
        duration: 1.5,
      })
    }else if(txDetails.to){
      messageApi.open({
        type: 'error',
        content: 'Transaction Failed',
        duration: 1.50,
      })
    }


  },[isSuccess, messageApi, txDetails.to])

  async function fetchDexSwap(){

    const allowance = await axios.get(`https://api.1inch.io/v5.0/1/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${address}`)
  
    if(allowance.data.allowance === "0"){

      const approve = await axios.get(`https://api.1inch.io/v5.0/1/approve/transaction?tokenAddress=${tokenOne.address}`)

      setTxDetails(approve.data);
      console.log("not approved")
      return

    }

    const tx = await axios.get(
      `https://api.1inch.io/v5.0/1/swap?fromTokenAddress=${tokenOne.address}&toTokenAddress=${tokenTwo.address}&amount=${tokenOneAmount.padEnd(tokenOne.decimals+tokenOneAmount.length, '0')}&fromAddress=${address}&slippage=${slippage}`
    )

    let decimals = Number(`1E${tokenTwo.decimals}`)
    setTokenTwoAmount((Number(tx.data.toTokenAmount)/decimals).toFixed(2));

    setTxDetails(tx.data.tx);
  
  }

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );
  return (
    <div>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="select a token"
      >
        {tokenList?.map((e, i) => {
          return (
            <div
              onClick={() => {
                modifyToken(i);
              }}
              key={i}
              className=" cursor-pointer flex gap-3 my-5 ml-3"
            >
              <img className="h-10 w-10" src={e.img} alt={e.ticker} />
              <div>
                <h2>{e.name}</h2>
                <h2>{e.ticker}</h2>
              </div>
            </div>
          );
        })}
      </Modal>
      <div className=" h-inherit mx-auto w-[40rem] p-5 mt-[5rem] bg-transparent/55   rounded-md ">
        <Popover
          content={settings}
          title="settings"
          trigger="click"
          placement="bottomRight"
        >
          <SettingOutlined className=" py-4  hover:scale-125 transition-all duration-700 ease-out hover:rotate-90" />
        </Popover>
        <div className="relative">
          <Input
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
          />
          <div
            onClick={switchTokens}
            className=" absolute z-10 left-[45%] top-[43%] cursor-pointer "
          >
            <ArrowDownOutlined className=" bg-gray-700  p-1 rounded-lg" />
          </div>
          <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
          <div
            onClick={() => openModal(1)}
            className="bg-gray-500 cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full absolute top-8 right-4"
          >
            <img src={tokenOne.img} className="h-8 w-8" alt="" />
            <h3>{tokenOne.ticker}</h3>
            <DownOutlined />
          </div>
          <div
            onClick={() => openModal(2)}
            className="bg-gray-500 cursor-pointer flex items-center gap-1 px-3 py-1 rounded-full absolute top-[66%] right-4"
          >
            <img src={tokenTwo.img} className="h-8 w-8" alt="" />
            <h3>{tokenTwo.ticker}</h3>
            <DownOutlined />
          </div>
        </div>
        <button onClick={fetchDexSwap} className="text-xl transition-all duration-300 ease-out hover:bg-blue-900 bg-blue-800 w-[50%] py-2 mt-2 ml-[8rem] border rounded-md border-blue-900">
          Swap
        </button>
      </div>
    </div>
  );
}

export default Swap;
