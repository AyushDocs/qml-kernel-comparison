import numpy as np
from numpy.typing import NDArray


def angle_encode_feature_map(x: NDArray) -> NDArray:
    d = x.shape[0]
    if d == 1:
        return np.array([np.cos(x[0]), np.sin(x[0])], dtype=complex)
    state = np.array([1.0 + 0.0j])
    for k in range(d):
        c, s = np.cos(x[k]), np.sin(x[k])
        qubit = np.array([c + 0.0j, s + 0.0j])
        state = np.kron(state, qubit)
    return state


def quantum_kernel_matrix(X: NDArray, Y: NDArray | None = None) -> NDArray:
    if Y is None:
        Y = X
    diff = X[:, np.newaxis, :] - Y[np.newaxis, :, :]
    cos_sq = np.cos(diff) ** 2
    K = np.prod(cos_sq, axis=2)
    return K


def quantum_kernel_stateful(X: NDArray, Y: NDArray | None = None) -> NDArray:
    if Y is None:
        Y = X
    n, d = X.shape
    m = Y.shape[0]
    K = np.zeros((n, m))
    for i in range(n):
        phi_i = angle_encode_feature_map(X[i])
        for j in range(m):
            phi_j = angle_encode_feature_map(Y[j])
            overlap = np.dot(np.conj(phi_i), phi_j)
            K[i, j] = np.abs(overlap) ** 2
    return K
