import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyGigs } from '../store/gigSlice';
import { fetchMyBids } from '../store/bidSlice';
import { Briefcase, DollarSign, Clock, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myGigs } = useSelector((state) => state.gigs);
  const { myBids } = useSelector((state) => state.bids);

  useEffect(() => {
    dispatch(fetchMyGigs());
    dispatch(fetchMyBids());
  }, [dispatch]);

  const openGigs = myGigs.filter(gig => gig.status === 'open');
  const assignedGigs = myGigs.filter(gig => gig.status === 'assigned');
  const pendingBids = myBids.filter(bid => bid.status === 'pending');
  const hiredBids = myBids.filter(bid => bid.status === 'hired');

  const stats = [
    {
      name: 'Posted Gigs',
      value: myGigs.length,
      icon: Briefcase,
      color: 'bg-blue-500',
      description: `${openGigs.length} open`
    },
    {
      name: 'Active Projects',
      value: assignedGigs.length,
      icon: TrendingUp,
      color: 'bg-green-500',
      description: 'In progress'
    },
    {
      name: 'My Bids',
      value: myBids.length,
      icon: DollarSign,
      color: 'bg-purple-500',
      description: `${pendingBids.length} pending`
    },
    {
      name: 'Hired',
      value: hiredBids.length,
      icon: Clock,
      color: 'bg-orange-500',
      description: 'Active work'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your gigs and bids
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/post-gig" className="card hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
                <Briefcase className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Post a New Gig</h3>
                <p className="text-sm text-gray-600">Find the perfect freelancer for your project</p>
              </div>
            </div>
          </Link>

          <Link to="/gigs" className="card hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Browse Open Gigs</h3>
                <p className="text-sm text-gray-600">Find opportunities and submit proposals</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Recent Gigs */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Recent Gigs</h2>
              <Link to="/my-gigs" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {myGigs.slice(0, 5).map((gig) => (
                <div key={gig._id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{gig.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">${gig.budget}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    gig.status === 'open' ? 'bg-green-100 text-green-800' : 
                    gig.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {gig.status}
                  </span>
                </div>
              ))}
              {myGigs.length === 0 && (
                <p className="text-center text-gray-500 py-8">No gigs posted yet</p>
              )}
            </div>
          </div>

          {/* My Recent Bids */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Recent Bids</h2>
              <Link to="/my-bids" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {myBids.slice(0, 5).map((bid) => (
                <div key={bid._id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{bid.gig?.title || 'Gig'}</h3>
                    <p className="text-sm text-gray-600 mt-1">Proposed: ${bid.proposedPrice}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    bid.status === 'hired' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {bid.status}
                  </span>
                </div>
              ))}
              {myBids.length === 0 && (
                <p className="text-center text-gray-500 py-8">No bids submitted yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
