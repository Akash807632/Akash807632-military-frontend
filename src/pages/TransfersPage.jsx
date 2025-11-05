import React from 'react';
import Navbar from '../components/common/Navbar';
import TransferList from '../components/Transfers/TransferList';

const TransfersPage = () => {
  return (
    <div>
      <Navbar />
      <TransferList />
    </div>
  );
};

export default TransfersPage;
