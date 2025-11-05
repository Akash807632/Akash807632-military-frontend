import React from 'react';
import Navbar from '../components/common/Navbar';
import AssignmentList from '../components/Assignments/AssignmentList';

const AssignmentsPage = () => {
  return (
    <div>
      <Navbar />
      <AssignmentList />
    </div>
  );
};

export default AssignmentsPage;
