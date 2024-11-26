import { QRCodeSVG } from 'qrcode.react';
import ExhibitionMap from './components/ExhibitionMap';
import './App.css';
import { Map } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600">Exhibition Navigator</h1>
          <div className="flex items-center space-x-4">
            <Map className="h-6 w-6 text-gray-500" />
            <span className="text-sm text-gray-600">Live Navigation</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Access</h2>
            <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
              <QRCodeSVG 
                value="https://7ba8-212-104-228-115.ngrok-free.app" 
                size={200}
                className="shadow-sm"
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-gray-600 text-center mt-4">
              Scan to open on your mobile device
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Exhibition Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-indigo-600">Total Stores</p>
                <p className="text-2xl font-bold text-indigo-700">24</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-sm text-emerald-600">Categories</p>
                <p className="text-2xl font-bold text-emerald-700">6</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="relative">
            <ExhibitionMap />
          </div>
        </div>
      </main>

      <footer className="bg-white shadow-md mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 Exhibition Navigator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;