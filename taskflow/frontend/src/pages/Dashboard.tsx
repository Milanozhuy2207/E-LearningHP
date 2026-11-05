import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const Dashboard = () => {
    const navigate = useNavigate();

    const [projects, setProjects] = useState<any[]>([]);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();

        const ownerId = localStorage.getItem('userId');

        if (!ownerId) {
            alert("Lỗi");
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/projects', {
                name: newName,
                description: newDesc,
                owner: ownerId
            });

            // alert("Tạo dự án thành công"); // Removed alert for a smoother experience

            setNewName("");
            setNewDesc("");
        } catch (error) {
            console.log("Lỗi tạo dự án:", error);
            alert("Tạo dự án thất bại!");
        }
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/projects');
                setProjects(response.data);
            } catch (error) {
                console.log("Lỗi lấy dữ liệu:", error);
            }
        };

        fetchProjects();

        socket.on("project_created", (newProject) => {
            console.log("Có dự án mới vừa được thêm vào", newProject);
            setProjects((danhsachcu) => [newProject, ...danhsachcu]);
        });

        return () => {
            socket.off("project_created");
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b-0 border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm flex items-center justify-center text-white font-bold">
                                T
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">TaskFlow</h1>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors bg-slate-100 hover:bg-red-50 px-4 py-2 rounded-lg"
                        >
                            Đăng Xuất
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-8">
                {/* Create Project Section */}
                <div className="mb-10">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Tạo Dự Án Mới</h2>
                        <form onSubmit={handleCreateProject} className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Tên dự án..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Mô tả ngắn gọn..."
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                className="flex-[2] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                required
                            />
                            <button 
                                type="submit" 
                                className="whitespace-nowrap rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-white font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
                            >
                                + Tạo Dự Án
                            </button>
                        </form>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dự án của bạn</h2>
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {projects.length} dự án
                    </span>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="mx-auto h-12 w-12 text-slate-300 mb-4">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">Không có dự án nào</h3>
                        <p className="mt-1 text-sm text-slate-500">Bắt đầu bằng cách tạo một dự án mới ở trên.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((proj, index) => (
                            <div 
                                key={proj._id || index} 
                                className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{proj.name}</h3>
                                <p className="text-slate-500 text-sm flex-1 leading-relaxed">{proj.description}</p>
                                
                                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                    <span className="text-xs font-medium text-slate-400">Đang hoạt động</span>
                                    <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;