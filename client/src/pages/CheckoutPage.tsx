import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CreditCard, 
  DollarSign, 
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    address: '',
    country: '',
    region: '',
    city: '',
    zipCode: '',
    email: '',
    phoneNumber: '',
    shipToBilling: false,
    cardName: '',
    cardNumber: '',
    expireDate: '',
    cvv: '',
    saveCardDetails: false
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit-card');
  const [showCardDetails, setShowCardDetails] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowCardDetails(method === 'credit-card');
  };

  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: DollarSign },
    { id: 'venmo', name: 'Venmo', icon: () => <span className="text-blue-600 font-bold">V</span> },
    { id: 'paypal', name: 'Paypal', icon: () => <span className="text-blue-600 font-bold">PP</span> },
    { id: 'amazon', name: 'Amazon Pay', icon: () => <span className="text-orange-600 font-bold">a</span> },
    { id: 'credit-card', name: 'Debit/Credit Card', icon: CreditCard }
  ];

  const countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];
  const regions = ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi', 'Gujarat'];
  const cities = ['Bangalore', 'Mumbai', 'Chennai', 'Delhi', 'Ahmedabad'];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing Information and Payment Option</h1>

        <div className="space-y-8">
          {/* Billing Information Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
            
            <div className="space-y-6">
              {/* User Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User name*
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  <Input
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name (Optional)
                </label>
                <Input
                  name="companyName"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address*
                </label>
                <Input
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              {/* Location Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country*
                  </label>
                  <div className="relative">
                    <select
                      value={formData.country}
                      onChange={(e) => handleSelectChange('country', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                    >
                      <option value="">Select...</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region/State*
                  </label>
                  <div className="relative">
                    <select
                      value={formData.region}
                      onChange={(e) => handleSelectChange('region', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                    >
                      <option value="">Select...</option>
                      {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City*
                  </label>
                  <div className="relative">
                    <select
                      value={formData.city}
                      onChange={(e) => handleSelectChange('city', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                    >
                      <option value="">Select...</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code*
                  </label>
                  <div className="relative">
                    <select
                      value={formData.zipCode}
                      onChange={(e) => handleSelectChange('zipCode', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                    >
                      <option value="">Select...</option>
                      <option value="560001">560001</option>
                      <option value="400001">400001</option>
                      <option value="600001">600001</option>
                      <option value="110001">110001</option>
                      <option value="380001">380001</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email*
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number*
                  </label>
                  <Input
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Ship to Billing Address */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shipToBilling"
                  checked={formData.shipToBilling}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, shipToBilling: checked as boolean }))
                  }
                />
                <label htmlFor="shipToBilling" className="text-sm text-gray-700">
                  Ship into Billing address
                </label>
              </div>
            </div>
          </div>

          {/* Payment Option Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Option</h2>
            
            <div className="space-y-4">
              {/* Payment Method Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-[#3AAFA9] bg-[#3AAFA9]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePaymentMethodChange(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === method.id
                          ? 'border-[#3AAFA9] bg-[#3AAFA9]'
                          : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === method.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <method.icon />
                        <span className="text-sm font-medium text-gray-700">
                          {method.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Credit Card Details */}
              {showCardDetails && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Card Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name on Card
                      </label>
                      <Input
                        name="cardName"
                        placeholder="Name on Card"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <Input
                        name="cardNumber"
                        placeholder="Card Number"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expire Date
                        </label>
                        <Input
                          name="expireDate"
                          placeholder="DD/YY"
                          value={formData.expireDate}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <Input
                          name="cvv"
                          placeholder="CVV"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveCardDetails"
                        checked={formData.saveCardDetails}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, saveCardDetails: checked as boolean }))
                        }
                      />
                      <label htmlFor="saveCardDetails" className="text-sm text-gray-700">
                        Save Card Details For Later
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Make Payment Button */}
          <div className="flex justify-center">
            <Button 
              className="bg-[#3AAFA9] hover:bg-[#2a8a85] text-white px-8 py-3 text-lg font-medium"
              onClick={() => {
                // Handle payment processing
                console.log('Processing payment...', formData);
                // Navigate to payment processing page
                navigate('/payment-processing');
              }}
            >
              Make Payment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
