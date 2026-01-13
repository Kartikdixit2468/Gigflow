import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBids } from '../store/bidSlice';
import { DollarSign, Clock, Briefcase } from 'lucide-react';

const MyBids = () => {
  const dispatch = useDispatch();
  const { myBids, loading } = useSelector((state) => state.bids);

  useEffect(() => {
    dispatch(fetchMyBids());
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
          <p className="mt-2 text-gray-600">Track all your submitted proposals</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : myBids.length === 0 ? (
          <div className="card text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No bids submitted yet</p>
            <p className="text-gray-400 text-sm mt-2">Browse gigs and submit your first proposal</p>
          </div>
        ) : (
          <div className="space-y-6">
            {myBids.map((bid) => (
              <div key={bid._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {bid.gig?.title || 'Gig Deleted'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </div>
                    
                    {bid.gig?.budget && (
                      <p className="text-sm text-gray-600 mb-3">
                        Client Budget: ${bid.gig.budget}
                      </p>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Your Proposal:</p>
                      <p className="text-gray-600">{bid.message}</p>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-primary-600" />
                        <span className="font-semibold">Your Price: ${bid.proposedPrice}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-primary-600" />
                        <span>Delivery: {bid.deliveryTime} days</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Submitted: {new Date(bid.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {bid.status === 'hired' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium text-sm flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Congratulations! You've been hired for this project.
                    </p>
                  </div>
                )}

                {bid.status === 'rejected' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">
                      This proposal was not selected. Keep improving and try again!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {myBids.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {myBids.filter(b => b.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Pending Proposals</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-green-600">
                {myBids.filter(b => b.status === 'hired').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Hired Projects</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-gray-600">
                {myBids.filter(b => b.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Not Selected</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBids;
