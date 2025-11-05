import React from 'react';
import Navbar from '../components/common/Navbar';
import PurchaseList from '../components/Purchases/PurchaseList';

const PurchasesPage = () => {
  return (
    <div>
      <Navbar />
      <PurchaseList />
    </div>
  );
};

export default PurchasesPage;
