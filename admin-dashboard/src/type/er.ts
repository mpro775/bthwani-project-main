import React from 'react';

export type ID = string;


export interface Account {
  _id: ID;
  code: string;
  name: string;
  parent?: ID | null;
  isLeaf?: boolean;
  isActive?: boolean;
  children?: Account[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountTreeNode {
  title: React.ReactNode;
  key: string;
  children?: AccountTreeNode[];
  data: Account;
}

export interface AccountFormData {
  code: string;
  name: string;
  isActive?: boolean;
  parent?: string;
}

export interface ModalState {
  open: boolean;
  edit?: boolean;
}


export interface JournalLine {
account: ID; // ObjectId للحساب
accountCode?: string; // اختياري لعرض سريع
accountName?: string; // اختياري لعرض سريع
debit?: number;
credit?: number;
currency?: string;
rate?: number; // مضاعِف العملة
memo?: string;
}


export interface JournalEntry {
_id?: ID;
voucherNo: string;
date: string; // ISO
description?: string;
reference?: string;
lines: JournalLine[];
isPosted?: boolean;
createdAt?: string;
}


export interface JournalQuery {
search?: string;
from?: string; // ISO date
to?: string; // ISO date
posted?: boolean;
}


export interface PagedResult<T = unknown> {
data: T[];
total?: number;
}