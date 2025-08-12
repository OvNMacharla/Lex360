import { firestore } from '../../config/firebase';

class RevenueService {
  constructor() {
    this.firestore = firestore();
  }

  // Record Payment/Transaction
  async recordTransaction(transactionData) {
    try {
      const transaction = {
        ...transactionData,
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: 'completed'
      };

      const transactionRef = await this.firestore.collection('transactions').add(transaction);
      
      // Update user revenue stats
      await this.updateUserRevenue(transactionData.lawyerId, transactionData.amount);
      
      return { success: true, transactionId: transactionRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Lawyer Revenue Stats
  async getLawyerRevenue(lawyerId, period = 'month') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const snapshot = await this.firestore
        .collection('transactions')
        .where('lawyerId', '==', lawyerId)
        .where('createdAt', '>=', startDate)
        .get();

      let totalRevenue = 0;
      let totalConsultations = 0;
      const transactions = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalRevenue += data.amount;
        totalConsultations += 1;
        transactions.push({ id: doc.id, ...data });
      });

      return {
        success: true,
        data: {
          totalRevenue,
          totalConsultations,
          averagePerConsultation: totalConsultations > 0 ? totalRevenue / totalConsultations : 0,
          transactions,
          period
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update User Revenue (private method)
  async updateUserRevenue(userId, amount) {
    try {
      const userRef = this.firestore.collection('users').doc(userId);
      
      await userRef.update({
        'revenue.total': firestore.FieldValue.increment(amount),
        'revenue.consultations': firestore.FieldValue.increment(1),
        'revenue.lastUpdated': firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Revenue Analytics
  async getRevenueAnalytics(lawyerId) {
    try {
      // Get monthly revenue for the last 12 months
      const monthlyData = [];
      const now = new Date();

      for (let i = 11; i >= 0; i--) {
        const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const snapshot = await this.firestore
          .collection('transactions')
          .where('lawyerId', '==', lawyerId)
          .where('createdAt', '>=', startDate)
          .where('createdAt', '<=', endDate)
          .get();

        const monthRevenue = snapshot.docs.reduce((total, doc) => {
          return total + doc.data().amount;
        }, 0);

        monthlyData.push({
          month: startDate.toLocaleDateString('en', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          consultations: snapshot.size
        });
      }

      return { success: true, data: { monthlyData } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new RevenueService();