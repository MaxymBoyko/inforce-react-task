"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";

type Product = {
    id: number;
    imageUrl: string;
    name: string;
    count: number;
    size: {
        width: number;
        height: number;
    };
    weight: string;
    comments: Comment[];
};

type Comment = {
    id: number;
    pruductId: number;
    description: string;
    date: string;
};

type SortOption = "alphabetical" | "count";


const sortProducts = (products: Product[], sortBy: SortOption) => {
    const sorted = [...products];
    if (sortBy === "alphabetical") {
        sorted.sort((a, b) => {
            const nameCompare = a.name.localeCompare(b.name);
            if (nameCompare !== 0) return nameCompare;
            return a.count - b.count;
        });
    } else if (sortBy === "count") {
        sorted.sort((a, b) => {
            if (a.count !== b.count) return a.count - b.count;
            return a.name.localeCompare(b.name);
        });
    }
    return sorted;
};

const initialProductState: Omit<Product, "id"> = {
    imageUrl: "",
    name: "",
    count: 0,
    size: { width: 0, height: 0 },
    weight: "",
    comments: [],
};

const ProductsList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState<null | number>(null);
    const [sortBy, setSortBy] = useState<SortOption>("alphabetical");
    const [newProduct, setNewProduct] = useState(initialProductState);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:3033/products");
                if (!response.ok) throw new Error("Failed to fetch products");
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error loading products:", error);
            }
        };
        fetchProducts();
    }, []);

    const handleAddProduct = () => {
        setShowAddModal(true);
    };

    const handleConfirmAdd = () => {
        if (
            !newProduct.name.trim() ||
            !newProduct.imageUrl.trim() ||
            !newProduct.weight.trim() ||
            newProduct.count <= 0 ||
            newProduct.size.width <= 0 ||
            newProduct.size.height <= 0
        ) {
            return;
        }
        setProducts([
            ...products,
            { ...newProduct, id: Date.now() },
        ]);
        setShowAddModal(false);
    };

    const handleDeleteProduct = (id: number) => {
        setShowDeleteModal(id);
    };

    const handleConfirmDelete = () => {
        if (showDeleteModal !== null) {
            setProducts(products.filter((p) => p.id !== showDeleteModal));
            setShowDeleteModal(null);
        }
    };

    const handleCancelDelete = () => setShowDeleteModal(null);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (name === "width" || name === "height") {
            setNewProduct((prev) => ({
                ...prev,
                size: {
                    ...prev.size,
                    [name]: Number(value),
                },
            }));
        } else if (name === "count") {
            setNewProduct((prev) => ({
                ...prev,
                count: Number(value),
            }));
        } else {
            setNewProduct((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const sortedProducts = sortProducts(products, sortBy);

    return (
        <div>
            <div className="flex justify-between items-center mb-4 p-4 rounded shadow ">
                <button
                    onClick={handleAddProduct}
                    className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                    Add Product
                </button>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <option className="bg-white text-black hover:bg-blue-100" value="alphabetical">Sort by Name</option>
                    <option className="bg-white text-black hover:bg-blue-100" value="count">Sort by Count</option>
                </select>
            </div>
            <div className="m-4 p-4 ">
                <ul>
                    {sortedProducts.map((product) => (
                        <li key={product.id} className="mb-4 p-4 border rounded shadow">
                            <div className="flex items-center gap-4">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    width={50}
                                    height={50}
                                    className="w-12 h-12 object-cover rounded shadow-sm"
                                />
                                <div className="flex-1">
                                    <Link href={`/${product.id}`}>
                                        <strong>{product.name}</strong>
                                    </Link>
                                    <div>Count: {product.count}</div>
                                    <div>Size: {product.size.width}x{product.size.height}</div>
                                    <div>Weight: {product.weight}</div>
                                </div>
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="text-red-600 hover:text-red-800 font-semibold px-3 py-1 rounded transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center ">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-black">
                        <h3 className="text-lg font-semibold mb-4">Add Product</h3>
                        <input
                            name="name"
                            placeholder="Name"
                            value={newProduct.name}
                            onChange={handleInputChange}
                            className="block mb-3 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            name="imageUrl"
                            placeholder="Image URL"
                            value={newProduct.imageUrl}
                            onChange={handleInputChange}
                            className="block mb-3 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <label className="block mb-2">
                            How many items?
                        </label>
                        <input
                            name="count"
                            type="number"
                            placeholder="Count"
                            value={newProduct.count}
                            onChange={handleInputChange}
                            className="block mb-3 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            min={1}
                        />
                        <label className="block mb-2">
                            Size (Width x Height):
                        </label>
                        <input
                            name="width"
                            type="number"
                            placeholder="Width"
                            value={newProduct.size.width}
                            onChange={handleInputChange}
                            className="block mb-3 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            min={1}
                        />
                        <input
                            name="height"
                            type="number"
                            placeholder="Height"
                            value={newProduct.size.height}
                            onChange={handleInputChange}
                            className="block mb-3 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            min={1}
                        />
                        <input
                            name="weight"
                            placeholder="Weight (e.g. 200g)"
                            value={newProduct.weight}
                            onChange={handleInputChange}
                            className="block mb-5 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
                                onClick={handleConfirmAdd}
                                disabled={
                                    !newProduct.name.trim() ||
                                    !newProduct.imageUrl.trim() ||
                                    !newProduct.weight.trim() ||
                                    newProduct.count <= 0 ||
                                    newProduct.size.width <= 0 ||
                                    newProduct.size.height <= 0
                                }
                            >
                                Add Product
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal !== null && (
                <div className="fixed inset-0 text-black z-50 flex items-center justify-center ">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
                        <p className="mb-4">Are you sure you want to delete this product?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                onClick={handleCancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                                onClick={handleConfirmDelete}
                            >
                                Delete Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default ProductsList;