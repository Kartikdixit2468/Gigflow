import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGigs } from '../store/gigSlice';
import { submitBid } from '../store/bidSlice';
import { Search, DollarSign, Clock, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Gigs = () => {
  const dispatch = useDispatch();
  const { gigs, loading } = useSelector((state) => state.gigs);
  const { user } = useSelector((state) => state.auth);
  
  const [search, setSearch] = useState('');
  const [selectedGig, setSelectedGig] = useState(null);
  const [bidForm, setBidForm] = useState({
    message: '',
    proposedPrice: '',
    deliveryTime: ''
  });

  useEffect(() => {
    dispatch(fetchGigs({ search, status: 'open' }));
  }, [dispatch, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleBidChange = (e) => {
    setBidForm({ ...bidForm, [e.target.name]: e.target.value });
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(submitBid({
        gigId: selectedGig._id,
        ...bidForm,
        proposedPrice: parseFloat(bidForm.proposedPrice),
        deliveryTime: parseInt(bidForm.deliveryTime)
      })).unwrap();
      
      toast.success('Bid submitted successfully!');
      setSelectedGig(null);
      setBidForm({ message: '', proposedPrice: '', deliveryTime: '' });
    } catch (err) {
      toast.error(err || 'Failed to submit bid');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Open Gigs</h1>
          <p className="mt-2 text-gray-600">Find opportunities and submit your proposals</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search gigs by title or description..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Gigs Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No gigs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <div key={gig._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {gig.owner?.avatar ? (
                      <img
                        src={gig.owner.avatar}
                        alt={gig.owner.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{gig.owner?.name}</p>
                      <p className="text-xs text-gray-500">Client</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Open
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{gig.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{gig.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-semibold">${gig.budget}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {user && gig.owner?._id !== user.id && (
                  <button
                    onClick={() => setSelectedGig(gig)}
                    className="w-full btn-primary"
                  >
                    Submit Proposal
                  </button>
                )}

                {user && gig.owner?._id === user.id && (
                  <p className="text-center text-sm text-gray-500">Your Gig</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bid Modal */}
        {selectedGig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Submit Proposal</h2>
                  <button
                    onClick={() => setSelectedGig(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedGig.title}</h3>
                  <p className="text-sm text-gray-600">{selectedGig.description}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    Budget: ${selectedGig.budget}
                  </p>
                </div>

                <form onSubmit={handleSubmitBid} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Proposal Message
                    </label>
                    <textarea
                      name="message"
                      value={bidForm.message}
                      onChange={handleBidChange}
                      required
                      minLength={20}
                      rows={6}
                      className="input-field resize-none"
                      placeholder="Describe why you're the best fit for this gig..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 20 characters</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proposed Price ($)
                      </label>
                      <input
                        type="number"
                        name="proposedPrice"
                        value={bidForm.proposedPrice}
                        onChange={handleBidChange}
                        required
                        min="1"
                        step="0.01"
                        className="input-field"
                        placeholder="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Time (days)
                      </label>
                      <input
                        type="number"
                        name="deliveryTime"
                        value={bidForm.deliveryTime}
                        onChange={handleBidChange}
                        required
                        min="1"
                        className="input-field"
                        placeholder="7"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setSelectedGig(null)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 btn-primary">
                      Submit Proposal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gigs;
