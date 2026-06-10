export default function Dashboard() {
  return (
    <div>
      <h1 className="text-4xl crm-title mb-8">
        AI CRM Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">Total Leads</h3>
          <p className="text-3xl font-bold text-blue-600">124</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">Qualified</h3>
          <p className="text-3xl font-bold text-green-600">68</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">31</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">Converted</h3>
          <p className="text-3xl font-bold text-purple-600">25</p>
        </div>
      </div>
    </div>
  );
}