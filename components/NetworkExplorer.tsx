
import React, { useContext, useEffect, useRef, useState, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { User, Post, Message, Notification } from '../types';
import { GlobeAltIcon, ServerIcon, UserCircleIcon, DocumentIcon, ChatBubbleOvalLeftEllipsisIcon } from './icons';
import { Link } from 'react-router-dom';

// --- Graph Types & Constants ---
interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  user: User;
}

interface GraphLink {
  source: string;
  target: string;
}

const REPULSION = 1000;
const SPRING_LENGTH = 120;
const SPRING_STRENGTH = 0.05;
const DAMPING = 0.85;
const CENTER_PULL = 0.03;

// --- Database Viewer Components ---

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
}

function DataTable<T extends { id: string }>({ data, columns, title }: DataTableProps<T>) {
  return (
    <div className="bg-secondary border border-gray-700 rounded-lg overflow-hidden shadow-lg mb-8">
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <ServerIcon className="w-5 h-5 text-accent" />
          {title} <span className="text-sm font-normal text-gray-400">({data.length} records)</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 font-medium border-b border-gray-700">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                    {col.accessor(item)}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                        No records found in this table.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// --- Main Network Explorer Component ---

const NetworkExplorer: React.FC = () => {
  const { users, posts, messages, notifications } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'graph' | 'database'>('graph');
  
  // Graph State
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  
  // Initialize Graph Data
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = 600; // Fixed height for graph

    const newNodes: GraphNode[] = users.map(u => ({
      id: u.id,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      user: u
    }));

    const newLinks: GraphLink[] = [];
    users.forEach(u => {
      u.following.forEach(targetId => {
        // Only create link if target exists
        if (users.some(target => target.id === targetId)) {
            newLinks.push({ source: u.id, target: targetId });
        }
      });
    });

    setNodes(newNodes);
    setLinks(newLinks);

  }, [users]); // Re-run if users change

  // Simulation Loop
  useEffect(() => {
    if (activeTab !== 'graph') {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        return;
    }

    const runSimulation = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = 600;

      setNodes(prevNodes => {
        const nextNodes = prevNodes.map(n => ({ ...n }));

        // 1. Repulsion (Coulomb's Law-ish)
        for (let i = 0; i < nextNodes.length; i++) {
          for (let j = i + 1; j < nextNodes.length; j++) {
            const nodeA = nextNodes[i];
            const nodeB = nextNodes[j];
            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 1) dist = 1; // Avoid division by zero

            const force = REPULSION / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            nodeA.vx += fx;
            nodeA.vy += fy;
            nodeB.vx -= fx;
            nodeB.vy -= fy;
          }
        }

        // 2. Attraction (Springs)
        links.forEach(link => {
          const source = nextNodes.find(n => n.id === link.source);
          const target = nextNodes.find(n => n.id === link.target);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const force = (dist - SPRING_LENGTH) * SPRING_STRENGTH;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          }
        });

        // 3. Center Gravity & Update
        nextNodes.forEach(node => {
          // Pull to center
          node.vx += (width / 2 - node.x) * CENTER_PULL;
          node.vy += (height / 2 - node.y) * CENTER_PULL;

          node.vx *= DAMPING;
          node.vy *= DAMPING;

          node.x += node.vx;
          node.y += node.vy;

          // Bounds check
          const radius = 20;
          if (node.x < radius) node.x = radius;
          if (node.x > width - radius) node.x = width - radius;
          if (node.y < radius) node.y = radius;
          if (node.y > height - radius) node.y = height - radius;
        });

        return nextNodes;
      });

      animationRef.current = requestAnimationFrame(runSimulation);
    };

    animationRef.current = requestAnimationFrame(runSimulation);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [links, activeTab]);

  // --- Database Column Definitions ---
  const userColumns: Column<User>[] = [
    { header: 'ID', accessor: u => <span className="font-mono text-xs text-gray-500">{u.id}</span> },
    { header: 'User', accessor: u => (
        <div className="flex items-center gap-2">
            <img src={u.avatar} alt="" className="w-6 h-6 rounded-full"/>
            <span className="font-medium text-white">{u.username}</span>
            {u.role === 'admin' && <span className="text-[10px] bg-red-600 text-white px-1 rounded">ADM</span>}
        </div>
    )},
    { header: 'Email', accessor: u => u.email },
    { header: 'Following', accessor: u => <span className="text-accent">{u.following.length}</span> },
    { header: 'Followers', accessor: u => <span className="text-accent">{u.followers.length}</span> },
  ];

  const postColumns: Column<Post>[] = [
    { header: 'ID', accessor: p => <span className="font-mono text-xs text-gray-500">{p.id}</span> },
    { header: 'Author ID', accessor: p => {
        const author = users.find(u => u.id === p.userId);
        return author ? <Link to={`/profile/${author.username}`} className="text-accent hover:underline">{author.username}</Link> : <span className="text-red-500">Unknown ({p.userId})</span>
    }},
    { header: 'Content', accessor: p => (
        <div className="flex items-center gap-2 max-w-xs truncate">
            {p.fileType.startsWith('image/') ? <span className="text-xs bg-blue-900 text-blue-200 px-1 rounded">IMG</span> : <span className="text-xs bg-purple-900 text-purple-200 px-1 rounded">FILE</span>}
            <span className="truncate">{p.caption}</span>
        </div>
    )},
    { header: 'Stats', accessor: p => <span className="text-xs">❤️ {p.likes.length} &nbsp; 💬 {p.comments.length}</span> },
    { header: 'Date', accessor: p => new Date(p.timestamp).toLocaleDateString() },
  ];

  const messageColumns: Column<Message>[] = [
    { header: 'ID', accessor: m => <span className="font-mono text-xs text-gray-500">{m.id}</span> },
    { header: 'From', accessor: m => {
        const u = users.find(x => x.id === m.senderId);
        return u ? <span className="font-semibold">{u.username}</span> : m.senderId
    }},
    { header: 'To', accessor: m => {
        const u = users.find(x => x.id === m.recipientId);
        return u ? <span className="font-semibold">{u.username}</span> : m.recipientId
    }},
    { header: 'Message', accessor: m => <span className="truncate max-w-xs block">{m.text}</span> },
    { header: 'Read', accessor: m => m.read ? <span className="text-green-500">Yes</span> : <span className="text-red-500">No</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <GlobeAltIcon className="w-8 h-8 text-accent" />
                Network Explorer
            </h1>
            <p className="text-gray-400 mt-2">Visualizing the interconnected database of Users, Posts, and Accounts.</p>
        </div>
        <div className="flex bg-secondary p-1 rounded-lg border border-gray-700 mt-4 md:mt-0">
            <button 
                onClick={() => setActiveTab('graph')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'graph' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
            >
                Graph Visualization
            </button>
            <button 
                onClick={() => setActiveTab('database')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'database' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
            >
                Database Inspector
            </button>
        </div>
      </div>

      {activeTab === 'graph' && (
        <div ref={containerRef} className="w-full h-[600px] bg-secondary border border-gray-700 rounded-xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-2 rounded border border-gray-700 pointer-events-none">
                <p className="text-xs text-gray-300 font-mono">NODES: {nodes.length} (Users)</p>
                <p className="text-xs text-gray-300 font-mono">EDGES: {links.length} (Follows)</p>
            </div>
            <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" />
                    </marker>
                    {users.map(u => (
                        <pattern key={`avatar-${u.id}`} id={`avatar-${u.id}`} height="100%" width="100%" patternContentUnits="objectBoundingBox">
                            <image href={u.avatar} preserveAspectRatio="xMidYMid slice" width="1" height="1" />
                        </pattern>
                    ))}
                </defs>
                
                {/* Links */}
                {links.map((link, i) => {
                    const sourceNode = nodes.find(n => n.id === link.source);
                    const targetNode = nodes.find(n => n.id === link.target);
                    if (!sourceNode || !targetNode) return null;
                    return (
                        <line 
                            key={i}
                            x1={sourceNode.x} y1={sourceNode.y}
                            x2={targetNode.x} y2={targetNode.y}
                            stroke="#4b5563"
                            strokeWidth="1.5"
                            markerEnd="url(#arrowhead)"
                            opacity="0.6"
                        />
                    );
                })}

                {/* Nodes */}
                {nodes.map(node => (
                    <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                        <circle 
                            r="22" 
                            fill={node.user.role === 'admin' ? '#dc2626' : '#2a2a2a'} 
                            className="transition-colors"
                        />
                        <circle 
                            r="20" 
                            fill={`url(#avatar-${node.id})`}
                            stroke="#1a1a1a"
                            strokeWidth="2"
                        />
                        <text 
                            y="35" 
                            textAnchor="middle" 
                            fill="#d1d5db" 
                            fontSize="12" 
                            className="font-semibold shadow-black drop-shadow-md"
                        >
                            {node.user.username}
                        </text>
                    </g>
                ))}
            </svg>
            <div className="absolute bottom-4 right-4 text-gray-500 text-xs italic">
                Real-time force-directed graph
            </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DataTable data={users} columns={userColumns} title="Users Table" />
            <DataTable data={posts} columns={postColumns} title="Posts Table" />
            <DataTable data={messages} columns={messageColumns} title="Messages Table" />
            
            {/* Raw JSON Dump for "Database" feel */}
            <div className="bg-black/40 border border-gray-800 rounded-lg p-4 font-mono text-xs text-green-500 overflow-x-auto">
                <p className="mb-2 text-gray-400">// System Statistics</p>
                <p>TOTAL_USERS: {users.length}</p>
                <p>TOTAL_POSTS: {posts.length}</p>
                <p>TOTAL_MESSAGES: {messages.length}</p>
                <p>TOTAL_RELATIONS: {users.reduce((acc, u) => acc + u.following.length, 0)}</p>
                <p>DB_STATUS: CONNECTED_LOCAL_STORAGE</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default NetworkExplorer;
