import React from 'react';
// import { Card, CardContent, Button } from '@/components/ui';
// import { AccountStatusCard } from './components/AccountStatusCard';
// import { LicenseWarningBanner } from './components/LicenseWarningBanner';
// import { LicenseDetailsCard } from './components/LicenseDetailsCard';

export const LicenseStatusDashboard: React.FC = () => {
  return <>test</>
  // if (isLoading) {
  //   return (
  //     <div className="space-y-4">
  //       <Card className="w-full">
  //         <CardContent className="flex items-center justify-center py-12">
  //           <div className="text-center space-y-4">
  //             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //             <p className="text-sm text-gray-600">Loading license information...</p>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }
  //
  // if (error && !licenseInfo) {
  //   return (
  //     <div className="space-y-4">
  //       <Card className="w-full border-red-200">
  //         <CardContent className="py-8">
  //           <div className="text-center space-y-4">
  //             <div className="text-red-600">
  //               <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
  //               </svg>
  //               <p className="font-medium text-lg">License Error</p>
  //             </div>
  //             <p className="text-sm text-gray-600 max-w-md mx-auto">{error}</p>
  //             <Button onClick={refreshLicense} variant="outline">
  //               <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  //               </svg>
  //               Retry
  //             </Button>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }
  //
  // return (
  //   <div className="space-y-6 max-w-4xl mx-auto p-6">
  //     <div className="flex items-center justify-between">
  //       <h1 className="text-2xl font-bold text-gray-900">License Management</h1>
  //       <Button
  //         onClick={refreshLicense}
  //         variant="outline"
  //         disabled={isLoading}
  //       >
  //         <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  //         </svg>
  //         {isLoading ? 'Refreshing...' : 'Refresh'}
  //       </Button>
  //     </div>
  //
  //     {/* Warning Banner - Show at top if there are warnings */}
  //     <LicenseWarningBanner />
  //
  //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  //       {/* Account Status */}
  //       <AccountStatusCard />
  //
  //       {/* Device Status */}
  //       <DeviceStatusCard />
  //     </div>
  //
  //     {/* License Details */}
  //     <LicenseDetailsCard />
  //
  //     {/* Error Display */}
  //     {error && (
  //       <Card className="border-yellow-200 bg-yellow-50">
  //         <CardContent className="py-4">
  //           <div className="flex items-start space-x-3">
  //             <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
  //             </svg>
  //             <div className="flex-1">
  //               <h4 className="font-medium text-yellow-800">Connection Issue</h4>
  //               <p className="text-sm text-yellow-700 mt-1">
  //                 {error} - Some information may be cached or outdated.
  //               </p>
  //             </div>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     )}
  //   </div>
  // );
};