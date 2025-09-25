//
//  ViewController.swift
//  imeuswe
//
//  Created by SPTR on 11/04/24.
//

import Foundation
import UIKit

class ViewController: UIViewController {
  
  private let imageView: UIImageView = {
    let imageView = UIImageView(frame: CGRect(x: 0, y: 0, width: 150, height: 150))
    imageView.image = UIImage(named: "launchScreen")
    return imageView
  }()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    view.addSubview(imageView)
    if #available(iOS 13.0, *) {
      view.backgroundColor = .link
    } else {
      // Fallback on earlier versions
    }
  }
  
  override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    imageView.center = view.center
    DispatchQueue.main.asyncAfter(deadline: .now()+0.5, execute: {
      self.animate()
    })
    animate()
  }
  
  private func animate() {
    UIView.animate(withDuration: 1, animations: {
      let size = self.view.frame.size.width * 1.5
      let diffx = size - self.view.frame.size.width
      let diffy = size - self.view.frame.size.height - size
      self.imageView.frame = CGRect( x: -(diffx/2), y: diffy/2, width: size, height: size)
    })
  }
}
