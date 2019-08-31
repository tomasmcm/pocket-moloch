import React, { useContext, useEffect, useState } from 'react';

import { ethToWei } from '@netgum/utils'; // returns BN

import { CurrentUserContext, CurrentWalletContext } from '../../contexts/Store';
import BcProcessorService from '../../utils/BcProcessorService';
import Web3Service from '../../utils/Web3Service';
import BottomNav from '../../components/shared/BottomNav';
import Loading from '../../components/shared/Loading';

const AddDevice = ({ match, history }) => {
  const [currentUser] = useContext(CurrentUserContext);
  const [currentWallet] = useContext(CurrentWalletContext);
  const deviceAddr = match.params.deviceAddr || '';
  const web3Service = new Web3Service();
  const bcprocessor = new BcProcessorService();
  const [accountDevices, setAccountDevices] = useState([]);
  const [deviceAdded, setDeviceAdded] = useState(false);
  const [deviceRemoved, setDeviceRemoved] = useState(false);
  const [loading, setLoading] = useState();

  useEffect(() => {
    const getDevices = async () => {
      if (currentUser && currentUser.sdk) {
        const _accountDevices = await currentUser.sdk.getConnectedAccountDevices();
        console.log(_accountDevices.items);

        setAccountDevices(_accountDevices.items);
      }
    };
    getDevices();
  }, [currentUser, deviceAdded, deviceRemoved]);

  const renderList = () => {
    return accountDevices.map((device, idx) => {
      return (
        <div className="Row Device" key={idx}>
          <p>{device.device.address}</p>
          {device.state === 'Deployed' ? (
            <button onClick={() => removeDevice(device.device.address)}>
              Remove
            </button>
          ) : (
            <button
              onClick={() => removeUnDeployedDevice(device.device.address)}
            >
              Remove for real
            </button>
          )}
        </div>
      );
    });
  };

  const removeUnDeployedDevice = async (addr) => {
    console.log('remove');

    await currentUser.sdk.removeAccountDevice(addr);
    const _accountDevices = await currentUser.sdk.getConnectedAccountDevices();

    setDeviceRemoved(true);

    console.log(_accountDevices.items);
  };
  const removeDevice = async (addr) => {
    setLoading(true);

    try {
      // console.log(' accountDevices', accountDevices);
      // console.log(currentWallet.eth);
      if (!accountDevices.find((item) => item.device.address === addr)) {
        alert('already removed');
        setLoading(false);
        return;
      }

      const estimated = await currentUser.sdk.estimateAccountDeviceUnDeployment(
        addr,
      );
      console.log('estimated', estimated);

      if (ethToWei(currentWallet.eth).lt(estimated.totalCost)) {
        alert(
          `you need more gas, at least: ${web3Service.fromWei(
            estimated.totalCost.toString(),
          )}`,
        );
        setLoading(false);
        return;
      }

      const hash = await currentUser.sdk.submitAccountTransaction(estimated);
      console.log('hash', hash);

      bcprocessor.setTx(
        hash,
        currentUser.attributes['custom:account_address'],
        `Undeploy Acount Device: ${deviceAddr} - remove for good at /devices`,
        true,
      );

      setDeviceRemoved(true);
      setLoading(false);
      history.push('/account');

    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const addAndDeployDevice = async () => {
    setLoading(true);

    try {
      // console.log(' accountDevices', accountDevices);
      // console.log(currentWallet.eth);
      if (accountDevices.find((item) => item.device.address === deviceAddr)) {
        alert('already added');
        setLoading(false);
        return;
      }
      await currentUser.sdk.createAccountDevice(deviceAddr);
      const estimated = await currentUser.sdk.estimateAccountDeviceDeployment(
        deviceAddr,
      );

      // console.log(
      //   currentWallet.eth,
      //   ethToWei(currentWallet.eth),
      //   estimated.totalCost,
      // );

      if (ethToWei(currentWallet.eth).lt(estimated.totalCost)) {
        alert(
          `you need more gas, at least: ${web3Service.fromWei(
            estimated.totalCost.toString(),
          )}`,
        );
        setLoading(false);
        return;
      }

      const hash = await currentUser.sdk.submitAccountTransaction(estimated);

      bcprocessor.setTx(
        hash,
        currentUser.attributes['custom:account_address'],
        `Add Acount Device: ${deviceAddr}`,
        true,
      );
      setDeviceAdded(true);
      setLoading(false);
      history.push('/account');

    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  return (
    <div className="View Pad">
      {loading && <Loading />}
      {currentWallet.state === 'Deployed' && deviceAddr && !deviceAdded ? (
        <div className="AddDevice">
          <h3>Are you sure you want to add this new device?</h3>
          <p>{deviceAddr}</p>
          <button onClick={() => addAndDeployDevice()}>
            Yes, Add the Device
          </button>
        </div>
      ) : (
        <p>adding/removing device will start a transaction</p>
      )}
      {accountDevices.length > 0 && (
        <>
          <h2>Current Approved Devices</h2>
          {renderList()}
        </>
      )}
      {!currentUser && <p className="Pad">Not logged in</p>}
      <BottomNav />
    </div>
  );
};

export default AddDevice;
