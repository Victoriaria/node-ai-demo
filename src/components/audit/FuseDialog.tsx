/**
 * NODE AI 审计系统 - 风险拦截弹窗
 */
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { getMessage } from '@/constants/messages'

interface FuseDialogProps {
  open: boolean
  reason: string
  thoughtChain: string[]
  onConfirm: () => void
  isChinese: boolean
}

export function FuseDialog({
  open,
  reason,
  thoughtChain,
  onConfirm,
  isChinese,
}: FuseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onConfirm()}>
      <DialogContent className="border border-red-800/50 bg-blue-950/90 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {getMessage('FUSE_TITLE', isChinese ? 'zh' : 'en')}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {getMessage(
              'FUSE_DESCRIPTION',
              isChinese ? 'zh' : 'en'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">
              {getMessage(
                'FUSE_REASON',
                isChinese ? 'zh' : 'en'
              )}
            </h4>
            <p className="text-sm text-gray-300">{reason}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2">
              {getMessage(
                'FUSE_THOUGHT_CHAIN',
                isChinese ? 'zh' : 'en'
              )}
            </h4>
            <ul className="space-y-1 text-sm text-gray-300">
              {thoughtChain.map((thought, index) => (
                <li key={`${index}-${thought}`} className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  {thought}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-400 text-white"
          >
            {getMessage(
              'CONFIRM_RESET',
              isChinese ? 'zh' : 'en'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
