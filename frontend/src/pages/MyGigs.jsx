import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyGigs, deleteGig } from '../store/gigSlice';
import { fetchBidsForGig, hireBid } from '../store/bidSlice';
import { Trash2, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyGigs = () => {
  const dispatch = useDispatch();
  const { myGigs, loading } = useSelector((state) => state.gigs);
  const { gigBids } = useSelector((state) => state.bids);
  const [selectedGig, setSelectedGig] = useState(null);

  useEffect(() => {
    dispatch(fetchMyGigs());
  }, [dispatch]);

  const handleViewBids = async (gig) => {
    setSelectedGig(gig);
    await dispatch(fetchBidsForGig(gig._id));
  };

  const handleHire = async (bidId) => {
    if (window.confirm('Are you sure you want to hire this freelancer? This action cannot be undone.')) {
      try {
        await dispatch(hireBid(bidId)).unwrap();
        toast.success('Freelancer hired successfully!');
        setSelectedGig(null);
        dispatch(fetchMyGigs());
      } catch (err) {
        toast.error(err || 'Failed to hire freelancer');
      }
    }
  };

  const handleDelete = async (gigId) => {
    if (window.confirm('Are you sure you want to delete this gig?')) {
      try {
        await dispatch(deleteGig(gigId)).unwrap();
        toast.success('Gig deleted successfully!');
      } catch (err) {
        toast.error(err || 'Failed to delete gig');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Posted Gigs</h1>
          <p className="mt-2 text-gray-600">Manage your gigs and review proposals</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : myGigs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No gigs posted yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {myGigs.map((gig) => (
              <div key={gig._id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{gig.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        gig.status === 'open' ? 'bg-green-100 text-green-800' : 
                        gig.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {gig.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{gig.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-semibold">${gig.budget}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {gig.status === 'open' && (
                      <button
                        onClick={() => handleViewBids(gig)}
                        className="btn-primary flex items-center"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        View Bids
                      </button>
                    )}
                    {gig.status === 'open' && (
                      <button
                        onClick={() => handleDelete(gig._id)}
                        className="btn-secondary text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bids Modal */}
        {selectedGig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Proposals for: {selectedGig.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">Budget: ${selectedGig.budget}</p>
                  </div>
                  <button
                    onClick={() => setSelectedGig(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                {gigBids.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No proposals yet</p>
                ) : (
                  <div className="space-y-4">
                    {gigBids.map((bid) => (
                      <div
                        key={bid._id}
                        className={`border rounded-lg p-6 ${
                          bid.status === 'hired' ? 'border-green-500 bg-green-50' : 
                          bid.status === 'rejected' ? 'border-gray-300 bg-gray-50 opacity-60' : 
                          'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {bid.freelancer?.avatar ? (
                              <img
                                src={bid.freelancer.avatar}
                                alt={bid.freelancer.name}
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-600 font-semibold">
                                  {bid.freelancer?.name?.[0] || 'U'}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{bid.freelancer?.name}</p>
                              <p className="text-sm text-gray-600">{bid.freelancer?.email}</p>
                            </div>
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            bid.status === 'hired' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {bid.status}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-4">{bid.message}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center text-gray-600">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span className="font-semibold">${bid.proposedPrice}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{bid.deliveryTime} days</span>
                            </div>
                          </div>

                          {bid.status === 'pending' && (
                            <button
                              onClick={() => handleHire(bid._id)}
                              className="btn-primary flex items-center"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Hire
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGigs;
