import React from 'react';
import { XCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function RejectedAccount() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold font-display mb-2">Account Not Approved</h1>
          <p className="text-muted-foreground mb-6">
            Your account request was not approved. If you believe this is an error, please contact your administrator.
          </p>
          <Button variant="outline" onClick={() => base44.auth.logout('/')}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}