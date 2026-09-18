import React from 'react'
import { Users, Filter } from 'lucide-react'

export default function Players() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Users className="w-6 h-6 text-primary" />
          <span>Key Players</span>
        </h2>
        <button className="flex items-center space-x-2 bg-card border border-border px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/50 text-gray-400 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Rank</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Risk Score</th>
              <th className="px-6 py-4 font-medium">PageRank</th>
              <th className="px-6 py-4 font-medium">Connections</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-gray-300">
            <PlayerRow rank="1" name="Ravi Kumar" score={78} pagerank="0.14" conns={24} />
            <PlayerRow rank="2" name="Amit Shah" score={65} pagerank="0.09" conns={18} />
            <PlayerRow rank="3" name="Suresh Yadav" score={52} pagerank="0.06" conns={11} />
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PlayerRow({ rank, name, score, pagerank, conns }) {
  return (
    <tr className="hover:bg-background/50 cursor-pointer transition-colors">
      <td className="px-6 py-4 text-primary font-bold">#{rank}</td>
      <td className="px-6 py-4 font-medium text-white">{name}</td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-danger" style={{ width: `${score}%` }}></div>
          </div>
          <span className="text-danger font-medium">{score}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-400">{pagerank}</td>
      <td className="px-6 py-4 text-gray-400">{conns}</td>
    </tr>
  )
}
