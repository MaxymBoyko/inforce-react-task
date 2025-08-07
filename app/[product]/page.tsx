'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

type Comment = {
    id: number;
    pruductId: number;
    description: string;
    date: string;
};

type Product = {
    id: number;
    imageUrl: string;
    name: string;
    count: number;
    size: { width: number; height: number };
    weight: number;
    comments: Comment[];
};

export default function ProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product>();
    const [editData, setEditData] = useState<Product>(product || {
        id: 0,
        imageUrl: '',
        name: '',
        count: 0,
        size: { width: 0, height: 0 },
        weight: 0,
        comments: [],
    });
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch("http://localhost:3033/products/" + params.product);
                if (!response.ok) throw new Error("Failed to fetch products");
                const data = await response.json();
                setProduct(data);
            } catch (error) {
                console.error("Error loading products:", error);
            }
        };
        fetchProduct();
    }, []);

    const handleEditOpen = () => {
        if (product) {
            setEditData(product as Product);
            setIsEditOpen(true);
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: name === 'price' ? Number(value) : value,
        }));
    };

    const handleEditSave = () => {
        setProduct((prev) => ({
            ...prev,
            ...editData,
        }));
        setIsEditOpen(false);
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        setProduct((prev) => {
            if (!prev) return prev;
            const newCommentObj: Comment = {
                id: Date.now(),
                pruductId: prev.id,
                description: newComment.trim(),
                date: new Date().toISOString(),
            };
            return {
                ...prev,
                comments: [
                    ...prev.comments,
                    newCommentObj,
                ],
            };
        });
        setNewComment('');
    };

    const handleDeleteComment = (id: number) => {
        setProduct((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                comments: prev.comments.filter((c) => c.id !== id),
            };
        });
    };

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <p className="text-gray-600 text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className='flex flex-col items-center p-4'>
            <h1 className='font-extrabold'>{product.name}</h1>
            <img
                src={product.imageUrl}
                alt={product.name}
                className="w-64 h-64 object-contain rounded-lg shadow mb-4"
            />
            <p><strong>Count:</strong> {product.count}</p>
            <p><strong>Size:</strong> {product.size.width} x {product.size.height}</p>
            <button onClick={handleEditOpen} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mb-4">
                Edit
            </button>

            <h2>Comments</h2>
            <ul>
                {product.comments.map((comment) => (
                    <li key={comment.id} style={{ marginBottom: 8 }}>
                        {comment.description}
                        <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className='ml-2 text-red-600 hover:text-red-800'
                            aria-label="Delete comment"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            <div style={{ marginTop: 16 }}>
                <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment"
                    style={{ width: 300, marginRight: 8 }}
                />
                <button onClick={handleAddComment}>Add</button>
            </div>

            {isEditOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-md relative">
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                            onClick={() => setIsEditOpen(false)}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                handleEditSave();
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editData.name}
                                    onChange={handleEditChange}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={editData.imageUrl}
                                    onChange={handleEditChange}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Count</label>
                                <input
                                    type="number"
                                    name="count"
                                    value={editData.count}
                                    onChange={handleEditChange}
                                    className="w-full border rounded px-3 py-2"
                                    min={0}
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Width</label>
                                    <input
                                        type="number"
                                        name="width"
                                        value={editData.size.width}
                                        onChange={e =>
                                            setEditData(prev => ({
                                                ...prev,
                                                size: { ...prev.size, width: Number(e.target.value) },
                                            }))
                                        }
                                        className="w-full border rounded px-3 py-2"
                                        min={0}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Height</label>
                                    <input
                                        type="number"
                                        name="height"
                                        value={editData.size.height}
                                        onChange={e =>
                                            setEditData(prev => ({
                                                ...prev,
                                                size: { ...prev.size, height: Number(e.target.value) },
                                            }))
                                        }
                                        className="w-full border rounded px-3 py-2"
                                        min={0}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Weight (g)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={editData.weight}
                                    onChange={handleEditChange}
                                    className="w-full border rounded px-3 py-2"
                                    min={0}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                    onClick={() => setIsEditOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}