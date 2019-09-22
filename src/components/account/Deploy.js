import React, { useContext } from 'react'
import BcProcessorService from '../../utils/BcProcessorService'
import Web3Service from '../../utils/Web3Service'
import { ethToWei } from '@netgum/utils' // returns BN

import { CurrentUserContext, CurrentWalletContext } from '../../contexts/Store'

const Deploy = () => {
  const [currentUser] = useContext(CurrentUserContext)
  const [currentWallet] = useContext(CurrentWalletContext)
  const web3Service = new Web3Service()

  return (
    <>
      {currentWallet.state !== 'Deployed' &&
        currentWallet.state !== 'Not Connected' &&
        currentWallet.nextState !== 'Deployed' && (
          <button
            onClick={() => {
              const sdk = currentUser.sdk
              const bcprocessor = new BcProcessorService()

              sdk
                .estimateAccountDeployment()
                .then(estimated => {
                  if (ethToWei(currentWallet.eth).lt(estimated.totalCost)) {
                    alert(
                      `you need more gas, at least: ${web3Service.fromWei(
                        estimated.totalCost.toString()
                      )}`
                    )

                    return false
                  }

                  sdk.deployAccount(estimated).then(data => {
                    bcprocessor.setTx(
                      data,
                      currentUser.attributes['custom:account_address'],
                      'Deploy contract wallet.',
                      true
                    )
                  })
                })
                // TODO: handle errors better
                // eslint-disable-next-line no-console
                .catch(err => console.log(err))
            }}
          >
            Deploy
          </button>
        )}
    </>
  )
}

export default Deploy
